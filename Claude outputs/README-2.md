Version 1 of the pipeline, written for the HyLift. Run in order:
- build.py  - materials, rig pivots and cylinders, keyframe the cycle  (common.py = helpers)
- ar_prep.py - cut polygons, join per moving body, unwrap
- ar_bake.py - bake shading, color, roughness into textures
- ar_export.py - Draco GLB + animated USDZ
- scene.py / rstill.py / ranim.py - realistic shop render (still or animation)
- lib.py - rebuilds _Library materials and shop scene
Paths currently point to Claude's workspace; they get generalized as more models go through.
