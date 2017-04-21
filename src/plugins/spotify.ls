``import { pluginBoilerplate, win, IS_LOCAL } from '../lib/plugins/plugin-boilerplate'``
``import { value, transform, compute } from '../lib/dom/observable'``
# ``import { ObservableArray, RenderingArray} from '../lib/dom/observable-array'``
# ``import xhr from '../lib/xhr'``
# ``import qs from '../lib/qs'``
# ``import load_sdk from '../lib/load-sdk-h'``
# ``import { rand, rand2, randomId, randomEl, randomIds, randomPos, randomDate, randomCharactor, between, lipsum, word, obj } from '../lib/random'``

``import '../elements/poem-state-machine'``

``import Client from '../spotify-sdk/src/Client'``
``import UserHandler from '../spotify-sdk/src/handlers/UserHandler'``
``import TrackHandler from '../spotify-sdk/src/handlers/TrackHandler'``
``import PlaylistHandler from '../spotify-sdk/src/handlers/PlaylistHandler'``
``import ArtistHandler from '../spotify-sdk/src/handlers/ArtistHandler'``

const DEFAULT_CONFIG =
  lala: 1155

# scopes
# playlist-read-private	Read access to user's private playlists.	"Access your private playlists"
# playlist-read-collaborative	Include collaborative playlists when requesting a user's playlists.	"Access your collaborative playlists"
# playlist-modify-public	Write access to a user's public playlists.	"Manage your public playlists"
# playlist-modify-private	Write access to a user's private playlists.	"Manage your private playlists"
# streaming	Control playback of a Spotify track. This scope is currently only available to Spotify native SDKs (for example, the iOS SDK and the Android SDK). The user must have a Spotify Premium account.	"Play music and control playback on your other devices"
# user-follow-modify	Write/delete access to the list of artists and other users that the user follows.	"Manage who you are following"
# user-follow-read	Read access to the list of artists and other users that the user follows.	"Access your followers and who you are following"
# user-library-read	Read access to a user's "Your Music" library.	"Access your saved tracks and albums"
# user-library-modify	Write/delete access to a user's "Your Music" library.	"Manage your saved tracks and albums"
# user-read-private	Read access to user’s subscription details (type of user account).	"Access your subscription details"
# user-read-birthdate	Read access to the user's birthdate.	"Receive your birthdate"
# user-read-email	Read access to user’s email address.	"Get your real email address"
# user-top-read	Read access to a user's top artists and tracks	"Read your top artists and tracks"

const location = win.location

const client = window.client = Client.instance
const client.settings =
  client-id: 'f7bfae75adcd472b9fd072d2be73cb0a'
  secret-id: '35ad58720c374cc1b3f3062919e3c550'
  scopes: 'user-follow-modify user-follow-read user-library-read user-top-read'
  redirect_uri: location.origin + location.pathname #window.location.href # 'http://localhost:1155/plugin/spotify'

# 1. login over oauth (and account display)
# 2. list playlists
# 3. play songs on some sort of js music player

User = new UserHandler
Track = new TrackHandler
Playlist = new PlaylistHandler
Artist = new ArtistHandler

spotify-player = ({config, G, set_config, set_data}) ->
  {h, s} = G
  G.width (v, old_width) !-> console.log \width, old_width, '->', v
  var my

  login = !->
    console.log "login!!"
    # TODO: figure out the expires and the refresh token stuff
    #  - https://developer.spotify.com/web-api/authorization-guide/
    # win.location.href = client.login_url \code
    # ... then in the session, check if our session has expired and request a new token

    # TODO: do this in a little popup window
    #  - in order to do so, the redirect url needs to save the token in the parent window and close itself, or
    #  - it can detect the referrer and close itself
    # win.add-event-listener \hashchange, (e) ->
    #   console.log \hashchange, e
    #   session!
    win.location.href = client.login_url!
    # win.w = win.open url, '_blank', 'toolbar=0,status=0,width=500,height=300,left=100,top=100'
    # win.w.onclose = (e) ->
    #   console.log 'onclose', e
    #   debugger

  logout = !->
    _token null

  _username = value!
  _foto = value!
  _token = value null
  _token (v, _v) !->
    # console.log \_token, v, _v
    if client.token = v
      User.me!then (me) !->
        console.log \me, me
        my := me
        _username me.display_name || me.id
        _foto me.images.0
        main.now '/my-music'
      .catch (e) !->
        _token null
    else local-storage.remove-item \token

  session = !->
    # debugger
    if h = local-storage.get-item \token
      h = JSON.parse h
      if (Date.parse h.e) > Date.now! => login!
      else client.token = t = h.t
    else if ~(h = location.hash).index-of \token
      client.token = t = h.split '&' .0.split '=' .1
      local-storage.set-item \token, JSON.stringify {t, e: Date.now! + 3600000} # TODO: actually parse expires_in
    else local-storage.remove-item \token
    if t => _token t


  main = h \poem-state-machine, {}, ->
    '/': ->
      h \div "main page"

    '/my-music': ->
      my.playlists!then (list) !->
        console.log 'my playlists:', list
        win.playlist = list
      h \div "my music"

  session!

  G.E.frame.aC [
    h \div.top-bar,
      transform _token, (t, _t) ->
        console.log 'top bar', t, _t, t is _t
        # debugger
        if t
          h \.user,
            h \.name, _username
            h \button {onclick: logout}, "logout"
        else
          h \button {onclick: login}, "login"
    h \div "body"
    main
  ]

plugin-boilerplate null, \testing, {}, {}, DEFAULT_CONFIG, spotify-player
