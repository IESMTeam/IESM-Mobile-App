import bpy
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/ar.blend')
sc=bpy.context.scene; sc.frame_start=0; sc.frame_end=720; sc.render.fps=30; sc.frame_set(0)
for im in bpy.data.images:
    if im.users==0: bpy.data.images.remove(im)
R={'barrel':0.35,'Stage2':0.6,'frame':0.8,'Stage1':0.85}
for o in bpy.data.objects:
    if o.type=='MESH':
        r=next((v for k,v in R.items() if k in o.name),1)
        if r<1: m=o.modifiers.new('d','DECIMATE'); m.ratio=r
# sample out the box images to disk names
bpy.ops.export_scene.gltf(filepath='/home/claude/td/ar/HyLift_AR.glb',export_format='GLB',export_animations=True,
    export_animation_mode='SCENE',export_anim_scene_split_object=False,export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,export_image_format='AUTO',export_apply=True)
bpy.ops.wm.usd_export(filepath='/home/claude/td/ar/HyLift_AR.usdz',export_animation=True,export_materials=True,
    generate_preview_surface=True,export_uvmaps=True,export_normals=True,convert_orientation=True,
    export_global_forward_selection='NEGATIVE_Z',export_global_up_selection='Y',export_lights=False,export_cameras=False,
    triangulate_meshes=True,usdz_downscale_size='KEEP')
print('EXPORTED')
