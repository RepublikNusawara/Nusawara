# Membuat halaman perekaman (film/index.html) dari peta publik + film.js.
# Pakai: python3 video/day5/build.py  -> lalu jalankan server & drive.js (lihat README.md)
import os, shutil
R = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(R, '..', '..')); OUT = '/tmp/filmwp'
os.makedirs(OUT, exist_ok=True)
h = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
for a, b in [('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','three.min.js'),
             ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','OrbitControls.js'),
             ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','GLTFLoader.js')]: h = h.replace(a, b)
s = open(os.path.join(R, 'film.js'), encoding='utf-8').read()
tail = "\nloop();\n})();"; i = h.rfind(tail); h = h[:i] + "\n" + s + "\n})();" + h[i+len(tail):]
h = h.replace('</head>', '<style>body>*:not(#app):not(#filmOv){display:none!important} #app>*:not(canvas){display:none!important}</style></head>', 1)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(h)
for d in ['data', 'assets', 'media']:
    p = os.path.join(OUT, d)
    if not os.path.exists(p): os.symlink(os.path.join(ROOT, d), p)
shutil.copytree(os.path.join(R, 'img'), os.path.join(OUT, 'img'), dirs_exist_ok=True)
for f in ['drive.js']: shutil.copy(os.path.join(R, f), OUT)
print('ok ->', OUT)
