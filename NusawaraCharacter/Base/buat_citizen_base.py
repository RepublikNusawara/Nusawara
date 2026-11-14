"""Republik Nusawara - citizen_base.glb
Karakter dasar warga: chibi, botak, tanpa pakaian/aksesori, T-pose, rangka humanoid.
Satuan meter, tinggi 2.0, sumbu Y ke atas, menghadap +Z, origin di tengah kaki (y=0).
Kiri karakter = +X (konvensi humanoid glTF/VRM/Mixamo saat menghadap +Z).
"""
import json, struct, math, sys
import numpy as np

# ---------------- primitif ----------------
def ellipsoid(c, r, seg=16, ring=12):
    v, n, t = [], [], []
    for i in range(ring + 1):
        th = math.pi * i / ring
        for j in range(seg + 1):
            ph = 2 * math.pi * j / seg
            d = np.array([math.sin(th) * math.sin(ph), math.cos(th), math.sin(th) * math.cos(ph)])
            v.append(np.array(c) + d * r)
            nn = d / np.array(r); n.append(nn / (np.linalg.norm(nn) or 1))
    for i in range(ring):
        for j in range(seg):
            a = i * (seg + 1) + j; b = a + seg + 1
            if i != 0: t.append((a, b, a + 1))
            if i != ring - 1: t.append((a + 1, b, b + 1))
    return np.array(v), np.array(n), np.array(t)

def capsule(p0, p1, rad, seg=10, ring=4, body=2):
    """kapsul dari p0 ke p1 (titik pusat ujung-ujungnya)."""
    p0, p1 = np.array(p0, float), np.array(p1, float)
    ax = p1 - p0; L = np.linalg.norm(ax); ax /= L
    tmp = np.array([0, 0, 1.0]) if abs(ax[2]) < .9 else np.array([1.0, 0, 0])
    u = np.cross(ax, tmp); u /= np.linalg.norm(u); w = np.cross(ax, u)
    rows = []   # (pusat, cos-ke-samping, sin-ke-sumbu)
    for i in range(ring + 1):                       # setengah bola bawah
        a = -math.pi / 2 + (math.pi / 2) * i / ring
        rows.append((p0, math.cos(a), math.sin(a)))
    for i in range(1, body):                        # badan
        rows.append((p0 + ax * L * i / body, 1.0, 0.0))
    for i in range(ring + 1):                       # setengah bola atas
        a = (math.pi / 2) * i / ring
        rows.append((p1, math.cos(a), math.sin(a)))
    v, n, t = [], [], []
    for (c, cs, sn) in rows:
        for j in range(seg + 1):
            ph = 2 * math.pi * j / seg
            d = (u * math.cos(ph) + w * math.sin(ph)) * cs + ax * sn
            v.append(c + d * rad); n.append(d / (np.linalg.norm(d) or 1))
    R = len(rows)
    for i in range(R - 1):
        for j in range(seg):
            a = i * (seg + 1) + j; b = a + seg + 1
            t.append((a, a + 1, b)); t.append((a + 1, b + 1, b))
    return np.array(v), np.array(n), np.array(t)

def cylinder(p0, p1, rad, seg=12):
    p0, p1 = np.array(p0, float), np.array(p1, float)
    ax = p1 - p0; ax /= np.linalg.norm(ax)
    u = np.cross(ax, [0, 0, 1.0]); u /= np.linalg.norm(u); w = np.cross(ax, u)
    v, n, t = [], [], []
    for c in (p0, p1):
        for j in range(seg + 1):
            ph = 2 * math.pi * j / seg; d = u * math.cos(ph) + w * math.sin(ph)
            v.append(c + d * rad); n.append(d)
    for j in range(seg):
        a, b = j, j + seg + 1
        t.append((a, a + 1, b)); t.append((a + 1, b + 1, b))
    return np.array(v), np.array(n), np.array(t)

def senyum(c, rad, tebal, sudut=70, seg=8, k=12):
    """tabung melengkung (mulut tersenyum) di bidang XY, sedikit menempel ke kepala."""
    v, n, t = [], [], []
    for i in range(k + 1):
        a = math.radians(-90 - sudut / 2 + sudut * i / k)
        pc = np.array([c[0] + rad * math.cos(a), c[1] + rad * math.sin(a) + rad, c[2]])
        tg = np.array([-math.sin(a), math.cos(a), 0.0]); nz = np.array([0, 0, 1.0]); bn = np.cross(tg, nz)
        for j in range(seg + 1):
            ph = 2 * math.pi * j / seg; d = nz * math.cos(ph) + bn * math.sin(ph)
            v.append(pc + d * tebal); n.append(d)
    for i in range(k):
        for j in range(seg):
            a = i * (seg + 1) + j; b = a + seg + 1
            t.append((a, b, a + 1)); t.append((a + 1, b, b + 1))
    return np.array(v), np.array(n), np.array(t)

# ---------------- rangka humanoid ----------------
X_SH, Y_SH = 0.235, 1.07
BONES = [  # nama, induk, posisi dunia
    ('Hips', None, (0, 0.66, 0)), ('Spine', 'Hips', (0, 0.80, 0)), ('Chest', 'Spine', (0, 0.96, 0)),
    ('Neck', 'Chest', (0, 1.11, 0)), ('Head', 'Neck', (0, 1.19, 0)),
    ('LeftShoulder', 'Chest', (0.10, Y_SH, 0)), ('LeftUpperArm', 'LeftShoulder', (X_SH, Y_SH, 0)),
    ('LeftLowerArm', 'LeftUpperArm', (0.46, Y_SH, 0)), ('LeftHand', 'LeftLowerArm', (0.66, Y_SH, 0)),
    ('RightShoulder', 'Chest', (-0.10, Y_SH, 0)), ('RightUpperArm', 'RightShoulder', (-X_SH, Y_SH, 0)),
    ('RightLowerArm', 'RightUpperArm', (-0.46, Y_SH, 0)), ('RightHand', 'RightLowerArm', (-0.66, Y_SH, 0)),
    ('LeftUpperLeg', 'Hips', (0.115, 0.60, 0)), ('LeftLowerLeg', 'LeftUpperLeg', (0.12, 0.34, 0)),
    ('LeftFoot', 'LeftLowerLeg', (0.12, 0.09, 0)), ('LeftToes', 'LeftFoot', (0.12, 0.03, 0.13)),
    ('RightUpperLeg', 'Hips', (-0.115, 0.60, 0)), ('RightLowerLeg', 'RightUpperLeg', (-0.12, 0.34, 0)),
    ('RightFoot', 'RightLowerLeg', (-0.12, 0.09, 0)), ('RightToes', 'RightFoot', (-0.12, 0.03, 0.13)),
]
BI = {b[0]: i for i, b in enumerate(BONES)}

# ---------------- bagian tubuh (mesh terpisah) ----------------
# setiap mesh: daftar (geometri, material, tulang)
HC = (0, 1.585, 0.0); HR = (0.405, 0.40, 0.37)      # kepala ~0.80 tinggi = 40% dari 2.0
FZ = HC[2] + HR[2]                                     # permukaan depan wajah
def muka(y, x=0.0, dz=0.0):                            # titik di permukaan depan elipsoid kepala
    dx, dy = x / HR[0], (y - HC[1]) / HR[1]
    return HC[2] + HR[2] * math.sqrt(max(0, 1 - dx * dx - dy * dy)) + dz

PARTS = {
  'Head': [
    (ellipsoid(HC, HR, 22, 16), 'Skin', 'Head'),
    (ellipsoid((0.40, 1.575, -0.01), (0.055, 0.085, 0.06), 10, 8), 'Skin', 'Head'),
    (ellipsoid((-0.40, 1.575, -0.01), (0.055, 0.085, 0.06), 10, 8), 'Skin', 'Head'),
    (ellipsoid((0, 1.525, muka(1.525) - .005), (0.03, 0.022, 0.022), 8, 6), 'Skin', 'Head'),
    (senyum((0, 1.455, muka(1.455) + .003), 0.055, 0.011), 'Mouth', 'Head'),
    (ellipsoid((0.20, 1.49, muka(1.49, .20) - .012), (0.045, 0.026, 0.012), 8, 6), 'Blush', 'Head'),
    (ellipsoid((-0.20, 1.49, muka(1.49, -.20) - .012), (0.045, 0.026, 0.012), 8, 6), 'Blush', 'Head'),
  ],
  'Eyes': [
    (ellipsoid((0.135, 1.595, muka(1.595, .135) - .012), (0.052, 0.078, 0.03), 12, 10), 'EyeDark', 'Head'),
    (ellipsoid((-0.135, 1.595, muka(1.595, -.135) - .012), (0.052, 0.078, 0.03), 12, 10), 'EyeDark', 'Head'),
    (ellipsoid((0.15, 1.625, muka(1.625, .15) + .012), (0.017, 0.022, 0.008), 6, 5), 'EyeLight', 'Head'),
    (ellipsoid((-0.12, 1.625, muka(1.625, -.12) + .012), (0.017, 0.022, 0.008), 6, 5), 'EyeLight', 'Head'),
  ],
  'Body': [
    (cylinder((0, 1.08, 0), (0, 1.22, 0), 0.085, 12), 'Skin', 'Neck'),
    (ellipsoid((0, 0.93, 0), (0.235, 0.255, 0.175), 18, 12), 'Skin', 'Chest'),
    (ellipsoid((0, 0.68, 0), (0.215, 0.135, 0.165), 14, 10), 'Skin', 'Hips'),
  ],
}
for s, sx in (('Left', 1), ('Right', -1)):
    PARTS[f'Arm_{s[0]}'] = [
        (capsule((sx * 0.19, Y_SH, 0), (sx * 0.46, Y_SH, 0), 0.068), 'Skin', f'{s}UpperArm'),
        (capsule((sx * 0.46, Y_SH, 0), (sx * 0.64, Y_SH, 0), 0.06), 'Skin', f'{s}LowerArm'),
    ]
    PARTS[f'Hand_{s[0]}'] = [
        (ellipsoid((sx * 0.715, Y_SH, 0.0), (0.075, 0.068, 0.055), 10, 8), 'Skin', f'{s}Hand'),
        (capsule((sx * 0.70, Y_SH + .015, 0.05), (sx * 0.73, Y_SH + .02, 0.085), 0.025, 6, 2, 1), 'Skin', f'{s}Hand'),
    ]
    PARTS[f'Leg_{s[0]}'] = [
        (capsule((sx * 0.115, 0.62, 0), (sx * 0.12, 0.34, 0), 0.088), 'Skin', f'{s}UpperLeg'),
        (capsule((sx * 0.12, 0.34, 0), (sx * 0.12, 0.11, 0), 0.075), 'Skin', f'{s}LowerLeg'),
    ]
    PARTS[f'Foot_{s[0]}'] = [
        (ellipsoid((sx * 0.12, 0.05, 0.045), (0.085, 0.05, 0.125), 10, 8), 'Skin', f'{s}Foot'),
    ]

MATS = {  # warna sRGB -> linear untuk baseColorFactor
    'Skin': ((0xe9, 0xb5, 0x8f), .85), 'EyeDark': ((0x24, 0x1a, 0x16), .25), 'EyeLight': ((0xff, 0xff, 0xff), .2),
    'Mouth': ((0x7a, 0x34, 0x2c), .6), 'Blush': ((0xf0, 0x98, 0x8c), .9),
}
lin = lambda c: (c / 255) ** 2.2 if c / 255 > .04045 else c / 255 / 12.92
MAT_ORDER = list(MATS)

# ---------------- tulis glTF biner ----------------
buf = bytearray(); views = []; accs = []
def add(arr, target=None, comp=5126, typ='VEC3', mm=False):
    global buf
    while len(buf) % 4: buf.append(0)
    data = arr.tobytes(); off = len(buf); buf += data
    views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), **({'target': target} if target else {})})
    a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': len(arr), 'type': typ}
    if mm: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    accs.append(a); return len(accs) - 1

nodes, meshes, tri_total, semua_v, semua_t, semua_m = [], [], 0, [], [], []
for name, parts in PARTS.items():
    prims = []
    for mat in MAT_ORDER:
        ps = [p for p in parts if p[1] == mat]
        if not ps: continue
        V, N, T, J = [], [], [], []; base = 0
        for (v, n, t), _, bone in ps:
            V.append(v); N.append(n); T.append(t + base); J.append(np.full(len(v), BI[bone])); base += len(v)
        V = np.vstack(V).astype(np.float32); N = np.vstack(N).astype(np.float32); T = np.vstack(T).astype(np.uint16)
        J = np.concatenate(J); joints = np.zeros((len(V), 4), np.uint8); joints[:, 0] = J
        W = np.zeros((len(V), 4), np.float32); W[:, 0] = 1
        tri_total += len(T)
        semua_v.append(V); semua_t.append(T + sum(len(x) for x in semua_v[:-1])); semua_m += [mat] * len(T)
        prims.append({'attributes': {'POSITION': add(V, 34962, mm=True), 'NORMAL': add(N, 34962),
                                     'JOINTS_0': add(joints, 34962, 5121, 'VEC4'), 'WEIGHTS_0': add(W, 34962, 5126, 'VEC4')},
                      'indices': add(T.reshape(-1), 34963, 5123, 'SCALAR'), 'material': MAT_ORDER.index(mat)})
    meshes.append({'name': name, 'primitives': prims})
    nodes.append({'name': name, 'mesh': len(meshes) - 1, 'skin': 0})

# tulang: translasi lokal relatif terhadap induk; tanpa rotasi (T-pose)
bone_node0 = len(nodes)
for bname, parent, pos in BONES:
    pw = np.array(pos); pp = np.array(BONES[BI[parent]][2]) if parent else np.zeros(3)
    nodes.append({'name': bname, 'translation': (pw - pp).tolist()})
for i, (bname, parent, _) in enumerate(BONES):
    kids = [bone_node0 + j for j, b in enumerate(BONES) if b[1] == bname]
    if kids: nodes[bone_node0 + i]['children'] = kids
ibm = np.array([np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [-p[0], -p[1], -p[2], 1]], np.float32).reshape(-1) for _, _, p in BONES], np.float32)
skin = {'name': 'NusawaraHumanoid', 'joints': list(range(bone_node0, bone_node0 + len(BONES))), 'skeleton': bone_node0,
        'inverseBindMatrices': add(ibm, None, 5126, 'MAT4')}
root = len(nodes)
nodes.append({'name': 'NusawaraCitizenBase', 'children': list(range(len(meshes))) + [bone_node0]})

gltf = {
  'asset': {'version': '2.0', 'generator': 'Republik Nusawara citizen_base generator',
            'extras': {'tinggi_m': 2.0, 'arah_depan': '+Z', 'origin': 'tengah kaki', 'pose': 'T-pose', 'segitiga': tri_total}},
  'scene': 0, 'scenes': [{'name': 'Scene', 'nodes': [root]}], 'nodes': nodes, 'meshes': meshes, 'skins': [skin],
  'materials': [{'name': m, 'pbrMetallicRoughness': {'baseColorFactor': [lin(c) for c in MATS[m][0]] + [1.0], 'metallicFactor': 0.0, 'roughnessFactor': MATS[m][1]}} for m in MAT_ORDER],
  'buffers': [{'byteLength': 0}], 'bufferViews': views, 'accessors': accs,
}
while len(buf) % 4: buf.append(0)
gltf['buffers'][0]['byteLength'] = len(buf)
js = json.dumps(gltf, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
out = sys.argv[1] if len(sys.argv) > 1 else 'citizen_base.glb'
with open(out, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(buf), 0x004E4942)); f.write(buf)
allv = np.vstack(semua_v)
print(f'{out}: {tri_total} segitiga, {len(allv)} titik, {len(meshes)} mesh, {len(BONES)} tulang')
print('batas:', allv.min(0).round(3), allv.max(0).round(3))
np.savez('/tmp/citizen_mesh.npz', v=allv, t=np.vstack(semua_t), m=np.array(semua_m))
