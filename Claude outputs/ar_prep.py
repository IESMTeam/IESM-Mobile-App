import bpy, math
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift.blend')
sc=bpy.context.scene; sc.frame_set(0); vl=bpy.context.view_layer
anim=[o for o in bpy.data.objects if o.animation_data and o.animation_data.action]
def owner(o):
    p=o.parent
    while p and p not in anim: p=p.parent
    return p
meshes=[o for o in bpy.data.objects if o.type=='MESH']
groups={}
for o in meshes: groups.setdefault(owner(o),[]).append(o)
# decimate heavy parts
for o in meshes:
    n=len(o.data.polygons)
    if n>2500:
        m=o.modifiers.new('dec','DECIMATE'); m.ratio=max(0.2,2500/n)
dg=bpy.context.evaluated_depsgraph_get()
joined=[]
for own,objs in groups.items():
    news=[]
    for o in objs:
        me=bpy.data.meshes.new_from_object(o.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
        me.transform(o.matrix_world)
        n=bpy.data.objects.new('tmp',me); sc.collection.objects.link(n); news.append(n)
    for x in vl.objects: x.select_set(False)
    for n in news: n.select_set(True)
    vl.objects.active=news[0]
    with bpy.context.temp_override(active_object=news[0],selected_editable_objects=news,selected_objects=news):
        bpy.ops.object.join()
    j=news[0]; j.name=('AR '+own.name) if own else 'AR frame'
    if own:
        j.parent=own; j.matrix_parent_inverse=own.matrix_world.inverted()
    me=j.data; me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(35))
    joined.append(j)
# delete originals and non-animated empties
for o in meshes: bpy.data.objects.remove(o)
for o in list(bpy.data.objects):
    if o.type=='EMPTY' and o not in anim and not o.children: bpy.data.objects.remove(o)
for o in list(bpy.data.objects):
    if o.type=='EMPTY' and o not in anim and not o.children: bpy.data.objects.remove(o)
# bake UVs
for j in joined:
    me=j.data; orig=me.uv_layers[0].name if len(me.uv_layers) else None
    uv=me.uv_layers.new(name='bake'); me.uv_layers.active=uv
    if orig: me.uv_layers[orig].active_render=True
    for x in vl.objects: x.select_set(False)
    j.select_set(True); vl.objects.active=j
    with bpy.context.temp_override(active_object=j,object=j,selected_objects=[j],selected_editable_objects=[j]):
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(60),island_margin=0.004)
        bpy.ops.object.mode_set(mode='OBJECT')
    print(j.name,len(me.polygons),'tris~',sum(len(p.vertices)-2 for p in me.polygons),flush=True)
print('objects',[(o.name,o.type,o.parent.name if o.parent else None) for o in bpy.data.objects])
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/td/ar_prep.blend')
