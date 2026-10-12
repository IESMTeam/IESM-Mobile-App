import sys, math; sys.path.insert(0,'/home/claude/td')
from common import *
from mathutils import Vector, Matrix
O=load()
for o in list(bpy.context.scene.objects):
    if o.type=='CAMERA': bpy.data.objects.remove(o)
sc=bpy.context.scene
FPS=30; sc.render.fps=FPS

# ---------- materials (matched to the shop photo) ----------
import random
def img_noise(name, size, fn):
    im=bpy.data.images.new(name,size,size,alpha=False); px=[0.0]*(size*size*4)
    for i in range(size*size):
        r,g,b=fn(i%size,i//size); px[i*4:i*4+4]=[r,g,b,1]
    im.pixels=px; return im
random.seed(4)
S=256
# bead-blast: fine random speckle in roughness (G channel), metallic=1 (B)
blast=img_noise('blast_mr',S,lambda x,y:(0, 0.40+random.uniform(-0.06,0.06), 1.0))
blast.file_format='JPEG'
def pbr(name, base, metal, rough, mr_img=None):
    m=bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree; b=nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=(*base,1); b.inputs['Metallic'].default_value=metal; b.inputs['Roughness'].default_value=rough
    if mr_img:
        t=nt.nodes.new('ShaderNodeTexImage'); t.image=mr_img
        sep=nt.nodes.new('ShaderNodeSeparateColor')
        nt.links.new(t.outputs['Color'],sep.inputs['Color'])
        nt.links.new(sep.outputs['Green'],b.inputs['Roughness']); nt.links.new(sep.outputs['Blue'],b.inputs['Metallic'])
    return m
M_BLAST=pbr('Stainless - bead blasted',(0.62,0.63,0.64),1.0,0.42,blast)
M_SATIN=pbr('Stainless - satin (cylinder barrel)',(0.66,0.67,0.68),1.0,0.28)
M_CHROME=pbr('Chrome - cylinder rod',(0.90,0.90,0.92),1.0,0.07)
M_DARK=pbr('Steel - dark (bearings)',(0.25,0.25,0.26),1.0,0.45)
M_UHMW=pbr('UHMW - white',(0.86,0.86,0.84),0.0,0.55)
M_RUBBER=pbr('Rubber - black',(0.03,0.03,0.03),0.0,0.75)
MAP={'polishedsteel':M_BLAST,'mattesteel':M_BLAST,'chromiumplate':M_CHROME,'castiron':M_DARK,'glossyrubber':M_RUBBER,
     'whitesolid':M_UHMW,'PlasticMT11000':M_UHMW,'whitelowglossplastic':M_UHMW,'defaultplastic':M_UHMW,'frostedplastic':M_UHMW}
allm=[o for o in sc.objects if o.type=='MESH']
for o in allm:
    nm=o.name.split('/')[-1]
    for i,slot in enumerate(o.material_slots):
        old=slot.material.name.split('.')[0] if slot.material else ''
        new=MAP.get(old,M_BLAST)
        if 'P000292' in nm: new=M_CHROME              # cylinder rods
        elif 'P000287' in nm: new=M_SATIN             # cylinder barrels
        o.material_slots[i].material=new
    # box-projected UVs so the blast texture can map onto CAD surfaces
    me=o.data
    if not me.uv_layers: me.uv_layers.new(name='UV')
    uv=me.uv_layers.active.data
    mw=o.matrix_world
    for poly in me.polygons:
        n=(mw.to_3x3()@poly.normal); ax=max(range(3),key=lambda k:abs(n[k]))
        for li in poly.loop_indices:
            p=mw@me.vertices[me.loops[li].vertex_index].co
            u,v=[(p.y,p.z),(p.x,p.z),(p.x,p.y)][ax]
            uv[li].uv=(u*12,v*12)

# ---------- rig ----------
PIV=Vector((-0.088,0,1.78))
def empty(name,loc):
    e=bpy.data.objects.new(name,None); sc.collection.objects.link(e); e.location=loc; e.empty_display_size=0.1; return e
def adopt(parent,objs):
    bpy.context.view_layer.update()
    for o in objs:
        mw=o.matrix_world.copy(); o.parent=parent; o.matrix_world=mw
E1=empty('Stage1 - lower cradle',PIV)
E2=empty('Stage2 - upper section',PIV)
adopt(E1,[O['AUTO-TD001-A300'],O['IESM A000008'],O['IESM A000008.001'],O['IESM A000088.002'],O['IESM A000088.001'],E2])
adopt(E2,[O['AUTO-TD001-A200'],O['IESM A000088.003'],O['IESM A000088']])

# cylinders: red = frame->A300 (stage 1), green = A300->A200 (stage 2)
ROD_PARTS=('P000292','P000278','A500FI','90291A576')
def pinc(o,key):
    pts=[]
    for m in meshes(o):
        if key in m.name: mn,mx=bbox(m); pts.append((mn+mx)/2)
    return sum(pts,Vector())/len(pts)
cyls=[]
for n,stage in [('IESM A000078',1),('IESM A000078.001',1),('IESM A000078.002',2),('IESM A000078.003',2)]:
    c=O[n]; B0=pinc(c,'A500SI'); R0=pinc(c,'A500FI')
    be=empty(n+' barrel',B0); re_=empty(n+' rod',B0)
    rods=[m for m in meshes(c) if any(k in m.name for k in ROD_PARTS)]
    bars=[m for m in meshes(c) if m not in rods]
    adopt(be,bars); adopt(re_,rods)
    cyls.append(dict(stage=stage,B0=B0,R0=R0,be=be,re=re_,L0=(R0-B0).length,phi0=math.atan2((R0-B0).z,(R0-B0).x)))
    print(n,'base',tuple(round(v,3) for v in B0),'rod end',tuple(round(v,3) for v in R0))

def rotY(p,th,c=PIV):
    d=p-c; return Vector((c.x+d.x*math.cos(th)+d.z*math.sin(th), p.y, c.z-d.x*math.sin(th)+d.z*math.cos(th)))
ease=lambda u: u*u*(3-2*u)
A1=math.radians(80); A2=math.radians(55)
UP,HOLD,DN,REST=10,3,10,1
T=UP+HOLD+DN+REST
def angles(t):
    h=UP/2
    if t<h: return A1*ease(t/h),0
    if t<UP: return A1,A2*ease((t-h)/h)
    if t<UP+HOLD: return A1,A2
    t2=t-UP-HOLD
    if t2<DN/2: return A1,A2*(1-ease(t2/(DN/2)))     # stage 2 comes down first
    if t2<DN: return A1*(1-ease((t2-DN/2)/(DN/2))),0
    return 0,0
N=int(T*FPS)
sc.frame_start=0; sc.frame_end=N
maxlen=[0]*4
for f in range(N+1):
    a1,a2=angles(f/FPS)
    E1.rotation_euler=(0,a1,0); E1.keyframe_insert('rotation_euler',frame=f)
    E2.rotation_euler=(0,a2,0); E2.keyframe_insert('rotation_euler',frame=f)
    for i,c in enumerate(cyls):
        if c['stage']==1: B=c['B0']; R=rotY(c['R0'],a1)
        else: B=rotY(c['B0'],a1); R=rotY(c['R0'],a1+a2)
        ax=R-B; L=ax.length; phi=math.atan2(ax.z,ax.x); th=c['phi0']-phi
        maxlen[i]=max(maxlen[i],L-c['L0'])
        c['be'].location=B; c['be'].rotation_euler=(0,th,0)
        c['re'].location=B+ax.normalized()*(L-c['L0']); c['re'].rotation_euler=(0,th,0)
        for e in (c['be'],c['re']):
            e.keyframe_insert('location',frame=f); e.keyframe_insert('rotation_euler',frame=f)
print('stroke used (m):',[round(x,3) for x in maxlen])
for o in list(sc.objects):
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves if hasattr(o.animation_data.action,'fcurves') else []:
            for k in fc.keyframe_points: k.interpolation='LINEAR'
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/td/hylift.blend')
bpy.ops.export_scene.gltf(filepath='/home/claude/td/HyLift_animated.glb', export_format='GLB', export_animations=True,
    export_force_sampling=True, export_frame_range=True, export_anim_single_armature=False, export_draco_mesh_compression_enable=False,
    export_image_format='JPEG', export_cameras=False, export_lights=False, export_animation_mode='SCENE')
print('done')
