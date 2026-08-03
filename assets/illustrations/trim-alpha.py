#!/usr/bin/env python3
"""Recadre un PNG RGBA sur la boîte englobante de son canal alpha.

Décodeur/encodeur PNG minimal (zlib seulement) : PIL n'est pas disponible.
Gère les PNG 8 bits non entrelacés, colortype 2 (RGB) et 6 (RGBA).
"""
import sys, zlib, struct


def read_png(path):
    data = open(path, 'rb').read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', 'pas un PNG'
    pos, idat, ihdr = 8, [], None
    while pos < len(data):
        (length,) = struct.unpack('>I', data[pos:pos + 4])
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        if ctype == b'IHDR':
            ihdr = struct.unpack('>IIBBBBB', chunk)
        elif ctype == b'IDAT':
            idat.append(chunk)
        elif ctype == b'IEND':
            break
        pos += 12 + length
    w, h, depth, color, comp, filt, interlace = ihdr
    assert depth == 8 and interlace == 0, f'non supporté: depth={depth} interlace={interlace}'
    assert color in (2, 6), f'colortype {color} non supporté'
    nch = 4 if color == 6 else 3
    raw = zlib.decompress(b''.join(idat))

    stride = w * nch
    out = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f == 1:
            for i in range(nch, stride):
                line[i] = (line[i] + line[i - nch]) & 0xFF
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i - nch] if i >= nch else 0
                b = prev[i]
                c = prev[i - nch] if i >= nch else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return w, h, nch, out


def write_png(path, w, h, rgba):
    stride = w * 4
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += rgba[y * stride:(y + 1) * stride]
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    open(path, 'wb').write(png)


def main(src, dst, thresh=8):
    w, h, nch, px = read_png(src)
    if nch == 3:
        print(f'{src}: aucun canal alpha — rien à recadrer'); return
    x0, y0, x1, y1 = w, h, -1, -1
    for y in range(h):
        row = y * w * 4
        for x in range(w):
            if px[row + x * 4 + 3] > thresh:
                if x < x0: x0 = x
                if x > x1: x1 = x
                if y < y0: y0 = y
                if y > y1: y1 = y
    if x1 < 0:
        print(f'{src}: entièrement transparent'); return
    cw, ch = x1 - x0 + 1, y1 - y0 + 1
    out = bytearray(cw * ch * 4)
    for y in range(ch):
        s = ((y + y0) * w + x0) * 4
        out[y * cw * 4:(y + 1) * cw * 4] = px[s:s + cw * 4]
    write_png(dst, cw, ch, out)
    print(f'{src} {w}x{h} -> {dst} {cw}x{ch}  (ratio {cw / ch:.3f})')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
