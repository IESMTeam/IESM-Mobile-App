import bpy, os, time
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift_scene.blend')
sc=bpy.context.scene
fr=list(range(0,301,3))+list(range(393,691,3))
for f in fr:
    p=f'/home/claude/td/frames/f_{f:03d}.png'
    if os.path.exists(p): continue
    t=time.time(); sc.frame_set(f); sc.render.filepath=p; bpy.ops.render.render(write_still=True)
    print('frame',f,round(time.time()-t,1),'s',flush=True)
print('DONE',flush=True)
