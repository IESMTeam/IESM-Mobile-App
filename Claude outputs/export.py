import bpy
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift.blend')
bpy.ops.export_scene.gltf(filepath='/home/claude/td/HyLift_animated_draco.glb', export_format='GLB', export_animations=True,
    export_force_sampling=True, export_frame_range=True, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
    export_image_format='JPEG', export_cameras=False, export_lights=False, export_animation_mode='SCENE', export_anim_scene_split_object=False)
