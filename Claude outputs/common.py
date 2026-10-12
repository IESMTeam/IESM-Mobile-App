import bpy, mathutils, math
def load():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath='/home/claude/v3/models/ToteDumpTwoStage.glb')
    return {o.name: o for o in bpy.context.scene.objects}
def meshes(o): return [c for c in [o]+list(o.children_recursive) if c.type=='MESH']
def bbox(o):
    pts=[]
    for c in meshes(o): pts+=[c.matrix_world @ mathutils.Vector(v) for v in c.bound_box]
    mn=mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx=mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
    return mn,mx
def flatmat(name,rgb):
    m=bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value=(*rgb,1); b.inputs['Roughness'].default_value=0.6
    return m
def paint(o,mat):
    for c in meshes(o):
        c.data.materials.clear(); c.data.materials.append(mat)
        for p in c.data.polygons: p.material_index=0
def setup_render(path,res=(1200,900),samples=16):
    sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=samples; sc.cycles.device='CPU'
    sc.render.resolution_x,sc.render.resolution_y=res; sc.render.filepath=path
    sc.cycles.use_denoising=False
    if not sc.world: sc.world=bpy.data.worlds.new('W')
    sc.world.use_nodes=True; sc.world.node_tree.nodes['Background'].inputs[0].default_value=(0.9,0.92,0.95,1); sc.world.node_tree.nodes['Background'].inputs[1].default_value=1.0
def camera(loc,target,lens=35,ortho=None):
    cam=bpy.data.cameras.new('C'); 
    if ortho: cam.type='ORTHO'; cam.ortho_scale=ortho
    cam.lens=lens; co=bpy.data.objects.new('C',cam); bpy.context.scene.collection.objects.link(co)
    co.location=loc; d=mathutils.Vector(target)-mathutils.Vector(loc); co.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    bpy.context.scene.camera=co; return co
def sun(rot=(0.8,0.2,0.6),e=3):
    l=bpy.data.lights.new('S','SUN'); l.energy=e; o=bpy.data.objects.new('S',l); bpy.context.scene.collection.objects.link(o); o.rotation_euler=rot
