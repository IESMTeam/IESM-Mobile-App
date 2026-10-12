import bpy, sys, time
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift_scene.blend')
sc=bpy.context.scene
for f in [int(x) for x in sys.argv[sys.argv.index('--')+1:]]:
    t=time.time(); sc.frame_set(f); sc.render.filepath=f'/home/claude/td/real_{f:03d}.png'; bpy.ops.render.render(write_still=True); print('frame',f,round(time.time()-t,1),'s')
