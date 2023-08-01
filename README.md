# Tower Defense Game

An attempt to develop a tower defense game. Probebly nothing super special, but a base to try some things.

Currently it uses a Hex field as playing area, towers can be placed and some spheres are moving towars the base.
If they reach it, you loose one point of 100. 

There is no cost or differnet units yet.

## How is it done

It uses [BabylonJS](https://www.babylonjs.com/) as Game Engine, also some ofthe textures from he BabylonJS Repo. Modeling is done with Blender (currently only one Asset) and additional textures with GIMP.

A level is definedby usin JSON. The same format is also used for save games. Those are currently saved in localstorage.

## How to run?

You need Node 14+ installed

```sh
npm install
npm start
```
Open [https://localhost:8080](https://localhost:8080) in your Browser