import bpy, numpy as np, time, sys
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/ar_prep.blend')
sc=bpy.context.scene; sc.frame_set(0); vl=bpy.context.view_layer
for _ in range(6):
    for o in list(bpy.data.objects):
        if o.type=='EMPTY' and not o.children and not (o.animation_data and o.animation_data.action): bpy.data.objects.remove(o)
vl.update(); vl=bpy.context.view_layer
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=int(sys.argv[-1]) if sys.argv[-1].isdigit() else 48
if not sc.world: sc.world=bpy.data.worlds.new('W')
sc.world.light_settings.distance=0.3
bk=sc.render.bake; bk.margin=16; bk.use_clear=True
objs=[o for o in bpy.data.objects if o.type=='MESH']
def size(o):
    n=o.name
    return 256 if 'rod' in n else 512 if 'barrel' in n else 2048
for o in objs:
    me=o.data; orig=[u.name for u in me.uv_layers if u.name!='bake']
    R=size(o)
    # per-object material copies, explicit UV for speckle texture
    for s in o.material_slots:
        m=s.material.copy(); m.name=s.material.name+' | '+o.name; s.material=m
        nt=m.node_tree
        for n in nt.nodes:
            if n.type=='TEX_IMAGE' and orig and not n.inputs['Vector'].is_linked:
                u=nt.nodes.new('ShaderNodeUVMap'); u.uv_map=orig[0]; nt.links.new(u.outputs['UV'],n.inputs['Vector'])
    imgs={}
    for k,cs in (('ao','Non-Color'),('col','sRGB'),('rough','Non-Color')):
        im=bpy.data.images.new(f'{o.name} {k}',R,R,alpha=False); im.colorspace_settings.name=cs; imgs[k]=im
    def target(im):
        for s in o.material_slots:
            nt=s.material.node_tree; t=nt.nodes.get('BAKE') or nt.nodes.new('ShaderNodeTexImage'); t.name='BAKE'; t.image=im; nt.nodes.active=t
    for x in vl.objects:
        if x: x.select_set(False)
    o.select_set(True); vl.objects.active=o
    t0=time.time()
    with bpy.context.temp_override(active_object=o,object=o,selected_objects=[o],selected_editable_objects=[o]):
        target(imgs['ao']); bpy.ops.object.bake(type='AO',uv_layer='bake')
        saved=[]
        for s in o.material_slots:
            if s.material.name.startswith('Stainless - bead'):
                bb=s.material.node_tree.nodes['Principled BSDF']
                for l in list(bb.inputs['Base Color'].links): s.material.node_tree.links.remove(l)
                bb.inputs['Base Color'].default_value=(0.62,0.62,0.60,1)
        for s in o.material_slots:
            b=s.material.node_tree.nodes['Principled BSDF']; saved.append(b.inputs['Metallic'].default_value); b.inputs['Metallic'].default_value=0
        target(imgs['col']); bk.use_pass_direct=False; bk.use_pass_indirect=False; bk.use_pass_color=True
        bpy.ops.object.bake(type='DIFFUSE',pass_filter={'COLOR'},uv_layer='bake')
        for s,v in zip(o.material_slots,saved): s.material.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value=v
        RV={'Stainless - bead':0.55,'Stainless - satin':0.22,'Chrome':0.07,'UHMW':0.55,'Rubber':0.8}
        for s in o.material_slots:
            b=s.material.node_tree.nodes['Principled BSDF']
            for l in list(b.inputs['Roughness'].links): s.material.node_tree.links.remove(l)
            b.inputs['Roughness'].default_value=next((v for k,v in RV.items() if s.material.name.startswith(k)),0.4)
        target(imgs['rough']); bpy.ops.object.bake(type='ROUGHNESS',uv_layer='bake')
        rp=np.array(imgs['rough'].pixels[:]).reshape(R,R,4)
        g=rp[...,0]; m=np.abs(g-0.36)<0.02
        rp[...,0]=rp[...,1]=rp[...,2]=g
        imgs['rough'].pixels[:]=rp.ravel()
    ao=np.array(imgs['ao'].pixels[:]).reshape(R,R,4)[...,0]
    ao=0.5+0.5*ao  # keep a little bounce light in creases
    col=np.array(imgs['col'].pixels[:]).reshape(R,R,4)
    base=bpy.data.images.new(f'{o.name} basecolor',R,R,alpha=False)
    # col pixels are linear; multiply in linear then store (image float buffer is linear for sRGB images)
    out=col.copy(); out[...,:3]*=ao[...,None]; out[...,3]=1
    base.pixels[:]=out.ravel(); base.file_format='JPEG'
    rough=imgs['rough']; rough.file_format='PNG'
    base.pack(); rough.pack()
    # rebuild materials: basecolor + roughness textures, constant metallic
    for s in o.material_slots:
        m=s.material; nt=m.node_tree; b=nt.nodes['Principled BSDF']
        met=b.inputs['Metallic'].default_value
        for n in list(nt.nodes):
            if n not in (b,nt.nodes.get('Material Output')): nt.nodes.remove(n)
        if not nt.nodes.get('Material Output'):
            mo=nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(b.outputs[0],mo.inputs[0])
        uvn=nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map='bake'
        tb=nt.nodes.new('ShaderNodeTexImage'); tb.image=base; nt.links.new(uvn.outputs[0],tb.inputs[0]); nt.links.new(tb.outputs['Color'],b.inputs['Base Color'])
        tr=nt.nodes.new('ShaderNodeTexImage'); tr.image=rough; nt.links.new(uvn.outputs[0],tr.inputs[0]); nt.links.new(tr.outputs['Color'],b.inputs['Roughness'])
        b.inputs['Metallic'].default_value=0.8 if m.name.startswith('Stainless - bead') else met
        for k in ('Normal',):
            for l in list(b.inputs[k].links): nt.links.remove(l)
    for k in ('ao','col'): bpy.data.images.remove(imgs[k])
    for n in orig: me.uv_layers.remove(me.uv_layers[n])
    me.uv_layers['bake'].active=True; me.uv_layers['bake'].active_render=True
    print(o.name,R,round(time.time()-t0,1),'s',flush=True)
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/td/ar.blend')
print('BAKED',flush=True)
