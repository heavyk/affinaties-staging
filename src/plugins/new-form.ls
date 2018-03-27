``import pluginBoilerplate from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
``import requestAnimationFrame from '../lib/dom/request-animation-frame'``

``import '../elements/poem-frame'``

window.THREE = T = require 'three'

# require 'three/examples/js/controls/TrackballControls'
require 'three/examples/js/controls/OrbitControls'
Stats = require 'three/examples/js/libs/stats.min'
Dat = require 'three/examples/js/libs/dat.gui.min'

# presentation:
# - allow switching between solids
# - in the selector scene, all the models are floating and can be selected
# - when showing the model, add a "floor" so that a shadow is cast, allowing for the form's shape to be captured easier
# - show/hide the poem-frame with maybe a button in the top right/left (sorta like a responsive menu)

# circle:
# - show that the radius of a circle, put on the edge will divide the circle into 6 parts (hexagon)
# - show that drawing another circle from any point on the edge will make:
#   - 1 in the middle of the vesica
#   - 2 on the outside dividing the combined diameters into 3 parts
#   - root 3 vertically from tip to tip of the vesica

# tetrahedron:
# - show it laying on its side where horizontally you see a line, and vertically you see the other line coming toward you (to show a different perspective the the typical one)

# cube:
# - show how pushing opposite corners of a cube will make a tetrahedron
# - show how pushing all the corners of a cube will make a octahedron
# - show how pushing edges of a cube makes a dodecahedron

# chestahedron:
# - show when it opens up to be an octahedron with a tetrahedron on top (and the root 3 in the diamond that forms)
# - allow for all sorts of measurements on the figure
# - show ratios between the measurements
# - demonstrate how it fits in a cube/sphere
#   - take the middle hexagon and extend its sides out to be a star of david (hexagram) and put a circle around it. this is the equator of the sphere
# - demonstrate that the top 3 kites are 3 parts of a 5 pointed star (and therefore pentagram)
# - ability to put the shape into wireframe, then vertically slide edges up the base to show how in the middle it forms a hexagon
# - the top triangle is .618 and the bottom one is one (golden ratio)
# - the distance between the bottom to the middle hexagon is longer than from the tip down to the middle hexagon (which is also the golden ratio)
#   - then show how when fitting the shape into a sphere, where all four points touch the sphere, the hexagon is in fact in the middle.
# - show the triangle made from connecting the middle of the bottom 3 triangles and the triangle made from connecting the top three kites
#   - if those two triangles are used to form two circles. and they are overlaid similar to the vesica piscis,
#     and you put a star in the bottom smaller circle and extend the lines up to the bigger top circle, the lines will divide the circle into 1/7ths
# - put it in a cube
#   - divide the cube faces into 16 parts, and show where the vertex touching the face hits (bottom left of A4)
#   - move the vertex diagonally toward the center to make an octahedron (with a tetrahedron on top)
#   - move the vertex diagonally toward the edge to make an tetrahedron
# - show the bottom half of a cone of 26° goes around the chestahedron, touching the bottom and middle vertices
#   - likewise, the top half of the cone it should go in the middle, touching the bottom edges and arriving to the top point
#   - finally show how the extra space at the bottom and the slightly shorter top are because that's where the cone arrives to the sphere
#   - additionally, show the ring at the top and the point at the bottom and the sphere in the middle (which corresponds to the cube in the center)
#   - this obviously has relationship with the energy coming in the north pole, coming down to the south pole and then returning out the ring at the north again
#   - https://www.youtube.com/watch?v=L_n2IzpFKFU

# octahedron / cube
# - show duel relationship
# - compute duels of forms using face to vert transform

# show reversals
# - figure out how to compute the reversal of a form

# measurements:
# - num verticies
# - num faces
# - face area
# - line length
# - total area
# - total line length

# solids:
# - tetrahedron (fire) (transforms)
# - octahedron (air) (reverses)
# - icosahedron (water) (changes)
# - cube (earth) (different)
# - dodecahedron (ether)

# contractive construction of the solids:
# first take tetrahedron and cut the edges off of them so it makes a hexagon looking thing
# result is a transitional form (but not a platonic solid)
# cut the corners off again, and you get an octahedron
# cut the corners off of the octahedron and again you get a transition form: the buckyball?
# once again, cut off the corners and you get a cube
# now, how do you get from the cube to the dodecahedron? this time, you have to cut off edges
# so, cut the edges off of the dodecahedron, you get an icosahedron


# ??? construction of of the solids:
# tetrahedron is 3 connected together
#   the first 3d shape (initiator - fire - transforms?)
# octahedron is 4 connected together (pyramid), but that's not enough, so it has to be doubled (air)
#   is a reversal because you need to set the pyramid on a mirror to see the octahedron
#   reversal turns things inside out
#   (mirroring a tetrahedron does not make a platonic form -- but why? -- because all points need to touch a surrounding sphere)
# icosahedron is 5 connected together to form a point doubled, with triangles inbetween
#   the two 5 sided ends of the icosahedron are not the same direction. one is slightly rotated from the other
#   it represents change
# square is 6 connected together which makes a hexagon. connect the vertices together and you have a flat surface.
#   the flat surface is 6 eq triangles
#   take distance between two vertices skipping one (which is root 3) and expand the center connected hexagon into a cube (using the size taken from the vertices)

# three squares together (cutting the faces of a cube in half) put togeter so they cross equals a cube. (8 mini cubes = big cube)
# three squares put together diagonally makes an octahedron. (where the squares form, they make triangles)
# you can then see that the dual relationship

# phi:
# - relationship between the length of the leg of the star to its leg width
# - top middle of the edge of a square, to the bottom-left corner and draw the arc (and likewise on bottom), will generate the gelden mean https://youtu.be/BcK9o4_48NU?t=8m18s

# pyramids:
# make a trapezoid where the base and sizes are size 1 and the top is size 0.618. draw diagonal lines beween the side corners crossing in the middle, and I think one of the egypt pyramids is on the bottom.
# two pyramids: grand pyramid & phi pyramid (base: .618, side: 1)

# TODO: show the progressions of the forms like frank did in his presentation (reversal, etc.)

# other forms:
# - explore expanding a square
# - decatria is what happens when you push vertices of a chestahedron (and edges too?)
#   (make a capacity in the program to be able to push edges or vertices)

# expansive cube research:
# - put a cube on its point so that a plane intersecting its lines will form a hexagon in the middle
# - using your "incorrect" form of expanding the chestahedron, there will be a point where the expanded form creates a corner of a cube ...
#   - the "kite" should become a square and the angles of the faces should be 90°

# videos:
# https://www.youtube.com/watch?v=wO1zMp89xX4
# 19-sided form needs stellation
# https://www.youtube.com/watch?v=HKO7iet8TZk
# something is wrong with how I form the chestahedron out of an opening tetrahedron:
# - I don't understand how he's getting the space on one of the sides. all three sides of the expanding tetrahedron should be similar
# - it looks like that happens when the bottom triangle of the kite is wider than the top triangle
# - when the kite triangles are equal, it forms the octahedron with a tetrahedron on top form
# - finally, I don't understand how he gets the space created.
# - he says that when he brought it out to 144°, then the space appeared
# - since the top kites are formed from the three legs of a pentagram, then perhaps it would require instead a wider shape to create the space?
# - what happens if you take the pentagram and fold it in only once -- it makes an octahedron?
# - at the end, he shows the resulting innerstellation creates a 15-sided form with three kites
# https://www.youtube.com/watch?v=HKO7iet8TZk

# circle progression: (# circles * 360°)
# 1 - none
# 2 - |tetrahedron| (4 * 180°)
# 3 - none? he says it doesn't exist. maybe a 5-sided form goes here?
# 4 - |octahedron| (8 * 180°)
# 5 - chestahedron (4 * 180° + 3 * 360°)
# 6 - |cube| (6 * 360°)
# 7 - didn't specify
# 8 - doesn't exist??
# 9 - found by frank
# 10 - |icosahedron| (20 * 180°)
# 11 - found by frank (says later it's 19 sides)
# 12 - found by frank
# 13 - found by frank
# 16 - found by frank
# 17 - found by frank
# 18 - |dodecahedron| (12 * 540°)
# 19 - unity of love?
# 20 - found by frank
# 22 - found by frank
#
# (he gives a hint that he found most of these new shapes by pushing *edges*)


# something really interesting is this:
#   http://stemkoski.github.io/Three.js/Polyhedra.html
#   https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/polyhedra.js
# based on models found here:
#   http://www.georgehart.com/virtual-polyhedra/vp.html
#
# what I would like to do is to list those models, but then make a game where the person has to start with a cube
# then push edges, or vertices to get from the platonic solids out to each of those shapes. think of it like a map
# where the squre and the tetrahedron are top dawgs and all shapes can be made out of them.


# how to make shapes out of tetrahedrons and octahedrons:
# https://en.wikipedia.org/wiki/Deltahedron

# 5 tetras = dodecahedron
# https://en.wikipedia.org/wiki/Compound_of_five_tetrahedra

# The dual for the tetrahedron is itself, another tetrahedron. The dual for the octahedron is the hexahedron (cube). The dual for the icosahedron is the dodecahedron.


for tris til 10
  for quads til 10
    for pents til 10
      total = (tris * 180) + (quads * 360) + (pents * 540)
      count = tris + quads + pents
      if count > 2 and total is (7 * 360)
        console.log "found possible:", count, "::", pents, "pents", quads, "quads", tris, "tris"
      # else console.log "total", total
      # if pents is 4 and quads is 1 and tris is 0
      #   debugger


to_geometry = (verts, faces) ->
  geometry = new T.Geometry

  # add vertices
  for v in verts
    geometry.vertices.push new T.Vector3 v.0, v.1, v.2

  # add faces
  for face in faces
    for i til face.length - 2
      # console.log "face:", face.0, face[i+1], face[i+2]
      geometry.faces.push new T.Face3 face.0, face[i+1], face[i+2]

  return geometry

apply_angle = (geometry, angle = Math.PI / 4) ->
  P0 = new T.Plane
  P0.setFromCoplanarPoints geometry.vertices[0], geometry.vertices[1], geometry.vertices[2]

  V1 = new T.Vector3
  V2 = new T.Vector3
  V3 = new T.Vector3

  V1.subVectors geometry.vertices[0], geometry.vertices[1]
  V2.subVectors geometry.vertices[2], geometry.vertices[0]
  V3.subVectors geometry.vertices[1], geometry.vertices[2]

  V1.normalize!
  V2.normalize!
  V3.normalize!

  VP1 = new T.Vector3
  VP2 = new T.Vector3
  VP3 = new T.Vector3

  VP1.crossVectors P0.normal, V1
  VP2.crossVectors P0.normal, V2
  VP3.crossVectors P0.normal, V3

  Q1 = new T.Quaternion
  Q2 = new T.Quaternion
  Q3 = new T.Quaternion

  deg60 = Math.PI / 1.5

  Q1.setFromAxisAngle VP1, deg60
  Q2.setFromAxisAngle VP2, deg60
  Q3.setFromAxisAngle VP3, deg60

  geometry.vertices[3].copy geometry.vertices[0]
  geometry.vertices[4].copy geometry.vertices[2]
  geometry.vertices[5].copy geometry.vertices[1]

  geometry.vertices[3].applyQuaternion Q1
  geometry.vertices[4].applyQuaternion Q2
  geometry.vertices[5].applyQuaternion Q3

  # TODO: this only works for L = 1. save the L when you make this a class(?)
  y = Math.sqrt 2 / 3
  y = y - (y / 3)

  geometry.vertices[3].set 0, y, 0
  geometry.vertices[4].set 0, y, 0
  geometry.vertices[5].set 0, y, 0

  Q1.setFromAxisAngle V1, angle
  Q2.setFromAxisAngle V2, angle
  Q3.setFromAxisAngle V3, angle

  geometry.vertices[3].applyQuaternion Q1
  geometry.vertices[4].applyQuaternion Q2
  geometry.vertices[5].applyQuaternion Q3

  P1 = new T.Plane
  P1.setFromCoplanarPoints geometry.vertices[3], geometry.vertices[4], geometry.vertices[0]

  R1 = new T.Ray (new T.Vector3 0,0,0), (new T.Vector3 0,1,0)
  R1.intersectPlane P1, geometry.vertices[6]

  geometry.normalsNeedUpdate = true
  geometry.verticesNeedUpdate = true
  # geometry.elementsNeedUpdate = true # not needed because the face indicies did not change

  geometry.computeFaceNormals!
  geometry

chestahedron = (L = 1) ->
  Xi = L / 2
  Hp = Math.sqrt 3
  Li = Xi * Hp
  Zi = Xi / Hp
  Yi = L * Math.sqrt 2 / 3
  Yf = Yi / 3

  verts = [
    [ 0, -Yf, Li - Zi ] # 0, bottom
    [ -Xi, -Yf, -Zi ]   # 1, bottom
    [ Xi, -Yf, -Zi ]    # 2, bottom
    [ 0, 0, 0 ]   # 3, mid (needs calculation)
    [ 0, 0, 0 ]   # 4, mid (needs calculation)
    [ 0, 0, 0 ]   # 5, mid (needs calculation)
    [ 0, 0, 0 ]   # 6, top (needs calculation)
  ]

  faces = [
    [0, 1, 2] #bottom
    [1, 0, 3]
    [0, 2, 4]
    [2, 1, 5]
    [5, 1, 3, 6]
    [4, 2, 5, 6]
    [3, 0, 4, 6]
  ]

  geometry = to_geometry verts, faces
  geometry = apply_angle geometry, 0

tetrahedron = (leni = 1) ->
  verts = [
    [  1, 1, 1 ]
    [ -1,-1, 1 ]
    [ -1, 1,-1 ]
    [  1,-1,-1 ]
  ]

  faces = [
    [2, 1, 0]
    [0, 3, 2]
    [1, 3, 0]
    [2, 3, 1]
  ]

  to_geometry verts, faces

# behold! the pentagon cube: the pube
pube = (leni = 1) ->
  # sqrt5 = Math.sqrt 5
  faces = [
    [0, 1, 2, 3]
  ]

  verts = [
    [ 1, 1, 1 ]
    [ 1, 1,-1 ]
    [ 1,-1, 1 ]
    [ 1,-1,-1 ]
    [-1, 1, 1 ]
    [-1, 1,-1 ]
    [-1,-1, 1 ]
    [-1,-1,-1 ]
  ]

  to_geometry verts, faces

dodecahedron = (leni = 1) ->
  sqrt5 = Math.sqrt 5
  phi = (1 + sqrt5) / 2
  leni = leni / 2 * phi
  ap = Math.sqrt 2 / (3 + sqrt5)
  alpha = leni * ap
  beta = leni * (1 + (Math.sqrt 6 / (3 + sqrt5) - 2 + 2 * ap))
  faces = [
    [0,1,9,16,5]
    [1,0,3,18,7]
    [1,7,11,10,9]
    [11,7,18,19,6]
    [8,17,16,9,10]
    [2,14,15,6,19]
    [2,13,12,4,14]
    [2,19,18,3,13]
    [3,0,5,12,13]
    [6,15,8,10,11]
    [4,17,8,15,14]
    [4,12,5,16,17]
  ]
  verts = [
    [-alpha, 0, beta]
    [alpha, 0, beta]
    [-leni, -leni, -leni]
    [-leni, -leni, leni]
    [-leni, leni, -leni]
    [-leni, leni, leni]
    [leni, -leni, -leni]
    [leni, -leni, leni]
    [leni, leni, -leni]
    [leni, leni, leni]
    [beta, alpha, 0]
    [beta, -alpha, 0]
    [-beta, alpha, 0]
    [-beta, -alpha, 0]
    [-alpha, 0, -beta]
    [alpha, 0, -beta]
    [0, beta, alpha]
    [0, beta, -alpha]
    [0, -beta, alpha]
    [0, -beta, -alpha]
  ]

  to_geometry verts, faces




const DEFAULT_CONFIG =
  base: '/plugin/new-form'

new-form = ({config, G, set_config, set_data}) ->
  # TODO: save this scope into the frame and let this be the bottom-most element
  {h, s} = G

  const LC = config.locale

  # MAIN RENDERER HERE:
  const WIDTH = G.width!
  const HEIGHT = G.height!
  const FOV = 70
  const NEAR = 0.01
  const FAR = 10

  renderer = new T.WebGLRenderer antialias: true, alpha: true
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  G.E.frame.aC el = renderer.domElement
  style = el.style
  style.position = \absolute
  style.top = style.left = 0

  camera = new T.PerspectiveCamera FOV, WIDTH / HEIGHT, NEAR, FAR
  camera.position.z = 3

  # TODO: change this to OrbitControls (orbit around the form)
  # TODO: the controls should be different for the main screen selector.
  # controls = new THREE.TrackballControls camera, el
  # controls.dynamicDampingFactor = 0.5
  # controls.rotateSpeed = 3

  controls = new T.OrbitControls camera, el
  controls.enableDamping = true
  controls.dampingFactor = 0.5


  light = new THREE.PointLight 0xffffff, 1, Infinity
  camera.add light

  # stats = new Stats
  # G.E.frame.aC el = stats.domElement
  # el.style.position = 'absolute'
  # el.style.top = 0

  animate = !->
    # TODO: save power on mobile devices - so recognise when the poem loses focus (add this to the boilerplate)

    # mesh.rotation.x += 0.015
    # mesh.rotation.y += 0.017
    # mesh.rotation.z += 0.019
    request-animation-frame animate
    renderer.render scene, camera
    controls.update!
    # stats.update!

  compute [G.width, G.height], (w, h) !->
    console.log "window size changed", w, h
    renderer.setSize w, h
    camera.aspect = w / h
    camera.updateProjectionMatrix!
    # controls.handleResize! # only used for TrackballControls


  #
  # SCENE
  scene = new T.Scene

  # geometry = new T.BoxGeometry 1, 1, 1
  # geometry = dodecahedron 0.5
  # geometry = pube 0.5
  # geometry = tetrahedron 0.5
  geometry = chestahedron 1 #0.5
  material = new T.MeshNormalMaterial #side: T.DoubleSide
  # material = new T.MeshBasicMaterial color: 0xFFFFFF,  side: T.DoubleSide

  mesh = new T.Mesh geometry, material
  scene.add mesh

  helper = new T.FaceNormalsHelper mesh, 2, 0x00ff00, 1
  # scene.add helper
  # END SCENE

  api =
    preset: 0
    angle: 0

  gui = new Dat.GUI width: 280, name: 'Chestahedron', closeOnTop: true, autoPlace: false
  folder = gui.addFolder 'expansiveness'
  preset = folder.add api, 'preset', {
    'none (0°)': 0
    'acute (<77°)': 1
    'balanced': 2
    'obtuse (>77°)': 3
    'custom': 4
  } .onChange !->
    switch api.preset * 1
    | 0 => # tetrahedron
      angle.setValue 0
    | 1 => # acute
      if api.angle isnt 35
        angle.setValue 35
    | 2 => # balanced
      console.log "TODO: find the angle where the lines make a hexagon"
      if api.angle isnt 77
        angle.setValue 77
      # the angle between the flaps of the opened tetrahedron should be 36.5°
      # TODO: measure the angle
    | 3 => # obtuse
      if api.angle isnt 105
        angle.setValue 105
    # | _ => console.log "default!"


  angle = folder.add api, 'angle', 0, 180
    .onChange (v) !->
      apply_angle geometry, (v / 360) * (Math.PI / 1)
      helper.update!
      if v is 0
        if api.preset isnt 0
          preset.setValue 0
      else if v < 77
        if api.preset isnt 1 #acute
          preset.setValue 1
      else if v > 77
        if api.preset isnt 3 #obtuse
          preset.setValue 3
      else if v is 77
        # TODO: lol, find the correct version of balanced
        if api.preset isnt 2
          preset.setValue 2
  folder.open!

  animate! # start it off!

  h \poem-frame, {config.base}, (_G) ->
    # TODO: G.width and G.height are supposed to be defined - but the obj inheritance is messing up for some reason
    # {h} = G

    @els [
      h \.top,
        h \.logo,
          h \a href: '/', "logo"
      h \.middle,
        @section \content
      h \.side-bar,
        @section \side
    ]

    # router
    '/chestahedron':
      enter: !->
        # TODO: make this whole thing encapsulate the entire scene and everything.
        @section \side -> gui.domElement
        @section \content ({h}) ->
          h \div "this is the chestahedron ... can't you see?"

      leave: !->
        console.log "tear down the chestahedron scene??"

    '/':
      enter: !->
        @section \side, -> null #gui.domElement
        @section \content, ({h}) ->
          console.log "init! this is the new-forms interface. mind blow coming soon"
          # TODO: show a carousel-like thing with all of the different forms on display
          # for now though, I'll just make a few links to the different sections
          h \div,
            h \h3 "expansive forms"
            h \div, h \a href: '/chestahedron', "chestahedron"
            h \h3 "platonic solids"
            h \div, h \a href: '/tetrahedron', "tetrahedron"
            h \div, h \a href: '/cube', "cube"
            h \div, h \a href: '/octahedron', "octahedron"
            h \div, h \a href: '/dodecahedron', "dodecahedron"

      # update: (route) !->
      # leave: (route, next) !->

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, new-form
