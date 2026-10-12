import bpy, math, sys, mathutils
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='/home/claude/td/hylift.blend')
sc=bpy.context.scene
for o in list(sc.objects):
    if o.type in ('LIGHT','CAMERA'): bpy.data.objects.remove(o)

def mat(name, base, rough, metal=0.0, **kw):
    m=bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree; b=nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=(*base,1); b.inputs['Roughness'].default_value=rough; b.inputs['Metallic'].default_value=metal
    for k,v in kw.items(): b.inputs[k].default_value=v
    return m,nt,b
def noise_rough(nt,b,scale,lo,hi,bump=0.0,bscale=None):
    tc=nt.nodes.new('ShaderNodeTexCoord'); n=nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=scale; n.inputs['Detail'].default_value=6
    nt.links.new(tc.outputs['Object'],n.inputs['Vector'])
    mr=nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value=lo; mr.inputs['To Max'].default_value=hi
    nt.links.new(n.outputs['Fac'],mr.inputs['Value']); nt.links.new(mr.outputs['Result'],b.inputs['Roughness'])
    if bump:
        n2=nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value=bscale or scale*10; n2.inputs['Detail'].default_value=2
        nt.links.new(tc.outputs['Object'],n2.inputs['Vector'])
        bp=nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value=bump; bp.inputs['Distance'].default_value=0.0005
        nt.links.new(n2.outputs['Fac'],bp.inputs['Height']); nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])

# --- realistic machine materials (replace the web ones) ---
blast,nt,b=mat('R Stainless blasted',(0.62,0.62,0.63),0.32,1.0); noise_rough(nt,b,60,0.26,0.40,bump=0.15,bscale=2500)
satin,nt,b=mat('R Stainless satin',(0.66,0.66,0.67),0.2,1.0, **{'Anisotropic':0.4}); noise_rough(nt,b,40,0.16,0.24)
chrome,_,_=mat('R Chrome',(0.85,0.86,0.88),0.05,1.0)
dark,_,_=mat('R Dark steel',(0.18,0.18,0.19),0.4,1.0)
uhmw,nt,b=mat('R UHMW',(0.82,0.82,0.80),0.45,0.0, **{'Subsurface Weight':0.15}); noise_rough(nt,b,30,0.4,0.55)
rubber,_,_=mat('R Rubber',(0.02,0.02,0.02),0.7)
swap={'Stainless - bead blasted':blast,'Stainless - satin (cylinder barrel)':satin,'Chrome - cylinder rod':chrome,'Steel - dark (bearings)':dark,'UHMW - white':uhmw,'Rubber - black':rubber}
for o in sc.objects:
    if o.type=='MESH':
        for s in o.material_slots:
            if s.material and s.material.name in swap: s.material=swap[s.material.name]
        for p in o.data.polygons: p.use_smooth=True
        # keep CAD hard edges: auto smooth by angle
        try:
            bpy.context.view_layer.objects.active=o
        except: pass

def box(name,loc,size,m):
    bpy.ops.mesh.primitive_cube_add(location=loc); o=bpy.context.object; o.name=name; o.scale=(size[0]/2,size[1]/2,size[2]/2); o.data.materials.append(m); return o
def plane(name,loc,size,rot,m):
    bpy.ops.mesh.primitive_plane_add(location=loc,rotation=rot); o=bpy.context.object; o.name=name; o.scale=(size[0]/2,size[1]/2,1); o.data.materials.append(m); return o

# --- shop building ---
conc,nt,b=mat('Concrete floor',(0.30,0.30,0.31),0.3); noise_rough(nt,b,3,0.18,0.45,bump=0.05,bscale=400)
n=nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=1.5; tc=nt.nodes.new('ShaderNodeTexCoord'); nt.links.new(tc.outputs['Object'],n.inputs['Vector'])
cr=nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color=(0.24,0.24,0.25,1); cr.color_ramp.elements[1].color=(0.36,0.36,0.37,1)
nt.links.new(n.outputs['Fac'],cr.inputs['Fac']); nt.links.new(cr.outputs['Color'],b.inputs['Base Color'])
plane('Floor',(0,0,0),(40,40),(0,0,0),conc)
wall,nt,b=mat('Wall panels',(0.55,0.56,0.57),0.55)
w=nt.nodes.new('ShaderNodeTexWave'); w.inputs['Scale'].default_value=6; tc=nt.nodes.new('ShaderNodeTexCoord'); nt.links.new(tc.outputs['Object'],w.inputs['Vector'])
bp=nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value=0.25; nt.links.new(w.outputs['Fac'],bp.inputs['Height']); nt.links.new(bp.outputs['Normal'],b.inputs['Normal'])
plane('Back wall',(-5,0,3.5),(7,30),(0,math.radians(90),0),wall)
plane('Side wall',(0,8,3.5),(30,7),(math.radians(90),0,0),wall)
ceil,_,_=mat('Ceiling black',(0.015,0.015,0.017),0.8)
plane('Ceiling',(0,0,6.5),(40,40),(math.radians(180),0,0),ceil)
blue,_,_=mat('Blue structural steel',(0.01,0.08,0.45),0.35,0.2, **{'Coat Weight':0.5})
for x,y in [(-4.6,-3),(-4.6,3),(-4.6,7.6),(3,7.6),(-1,7.6)]:
    box('Column',(x,y,3.25),(0.25,0.25,6.5),blue)
for y in [-3,3]:
    box('Beam',(-0.8,y,6.1),(8,0.2,0.35),blue)
box('Beam',(-4.4,0,5.0),(0.2,16,0.25),blue)
# LED panels + real light from them
led,nt,b=mat('LED',(1,1,1),0.5); b.inputs['Emission Color'].default_value=(1,0.98,0.95,1); b.inputs['Emission Strength'].default_value=8
for x,y in [(0,-1.2),(0,2.2),(-3,-1.2),(-3,2.2),(3,-1.2),(3,2.2),(0,5.5),(-3,5.5)]:
    plane('LED panel',(x,y,6.2),(1.2,0.35),(math.radians(180),0,0),led)
    l=bpy.data.lights.new('LED light','AREA'); l.shape='RECTANGLE'; l.size=1.2; l.size_y=0.35; l.energy=260; l.color=(1,0.98,0.95)
    lo=bpy.data.objects.new('LED light',l); sc.collection.objects.link(lo); lo.location=(x,y,6.15)
# shop props in the background: workbench, cart, safety post
bench,_,_=mat('Bench top',(0.35,0.28,0.2),0.6)
box('Workbench',(-4.2,4.5,0.9),(0.8,2.4,0.06),bench); box('Workbench legs',(-4.2,4.5,0.45),(0.7,2.3,0.9),blue)
yellow,_,_=mat('Safety yellow',(0.9,0.65,0.0),0.4)
box('Safety post',(2.6,6.5,0.6),(0.15,0.15,1.2),yellow)
cart,_,_=mat('Cart grey',(0.2,0.2,0.22),0.5,0.6)
box('Cart',(2.8,4.0,0.5),(1.2,0.8,1.0),cart)

# --- world: very dim fill so shadows stay soft but dark ---
w=sc.world or bpy.data.worlds.new('W'); sc.world=w; w.use_nodes=True
w.node_tree.nodes['Background'].inputs[0].default_value=(0.03,0.035,0.045,1); w.node_tree.nodes['Background'].inputs[1].default_value=1

# --- camera: low and close, looking up like the photo ---
cam=bpy.data.cameras.new('Cam'); cam.lens=26; cam.dof.use_dof=True; cam.dof.aperture_fstop=5.6
co=bpy.data.objects.new('Cam',cam); sc.collection.objects.link(co); sc.camera=co
co.location=(3.4,-4.2,1.1); tgt=Vector((-0.4,0.1,1.6))
co.rotation_euler=(tgt-co.location).to_track_quat('-Z','Y').to_euler(); cam.dof.focus_distance=(tgt-co.location).length

sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=int(sys.argv[-1]) if sys.argv[-1].isdigit() else 64
sc.cycles.use_adaptive_sampling=True; sc.cycles.use_denoising=True; sc.cycles.max_bounces=6; sc.cycles.glossy_bounces=4
sc.render.use_persistent_data=True
sc.render.resolution_x,sc.render.resolution_y=960,540
sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast'; sc.view_settings.exposure=-0.4
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/td/hylift_scene.blend')
