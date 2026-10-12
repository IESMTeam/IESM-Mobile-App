import bpy, os
OUT='/home/claude/i3d'
SHOP={'Back wall','Beam','Beam.001','Beam.002','Cam','Cart','Ceiling','Column','Column.001','Column.002','Column.003','Column.004','Floor','Safety post','Side wall','Workbench','Workbench legs'}
# --- materials library
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift_scene.blend')
ren={'R Stainless blasted':'IESM - Stainless blasted','R Stainless satin':'IESM - Stainless satin','R Chrome':'IESM - Chrome rod',
     'R UHMW':'IESM - UHMW white','R Rubber':'IESM - Rubber black','Blue structural steel':'IESM - Blue paint',
     'Safety yellow':'IESM - Safety yellow','Concrete floor':'IESM - Concrete floor'}
mats=[]
for k,v in ren.items():
    m=bpy.data.materials[k].copy(); m.name=v; mats.append(m)
b2=bpy.data.materials['R Stainless blasted'].copy(); b2.name='IESM - Stainless 2B'
p=b2.node_tree.nodes.get('Principled BSDF')
for l in list(p.inputs['Roughness'].links): b2.node_tree.links.remove(l)
for l in list(p.inputs['Normal'].links): b2.node_tree.links.remove(l)
p.inputs['Roughness'].default_value=0.12; mats.append(b2)
CAT='3f1c2a9e-5b7d-4c11-9a4e-1e5f0b2d7c01'
os.makedirs(OUT+'/_Library',exist_ok=True)
open(OUT+'/_Library/blender_assets.cats.txt','w').write('VERSION 1\n\n'+CAT+':IESM/Materials:IESM-Materials\n')
for m in mats: m.asset_mark(); m.asset_data.catalog_id=CAT; m.asset_data.description='IESM finish (Cycles render material)'
os.makedirs(OUT+'/_Library/Materials',exist_ok=True)
bpy.data.libraries.write(OUT+'/_Library/Materials/IESM_Materials.blend',set(mats),fake_user=True,compress=True)
# --- shop scene
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift_scene.blend')
for o in list(bpy.data.objects):
    if o.name not in SHOP and not o.name.startswith(('LED light','LED panel')): bpy.data.objects.remove(o)
bpy.ops.outliner.orphans_purge(do_recursive=True)
os.makedirs(OUT+'/_Library/Scenes',exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/_Library/Scenes/IESM_Shop.blend',compress=True)
print('LIB OK',len(bpy.data.objects))
