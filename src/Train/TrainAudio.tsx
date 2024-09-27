import { Route } from "../utils/interfaces";

let piano_a = require('../audio/piano_a.wav');
// Piano A.wav by pinkyfinger -- https://freesound.org/s/68437/ -- License: Creative Commons 0
let piano_b = require('../audio/piano_b.wav');
// Piano B.wav by pinkyfinger -- https://freesound.org/s/68438/ -- License: Creative Commons 0
let piano_c = require('../audio/piano_c.wav');
// Piano C.wav by pinkyfinger -- https://freesound.org/s/68441/ -- License: Creative Commons 0
let piano_d = require('../audio/piano_d.wav');
// Piano D.wav by pinkyfinger -- https://freesound.org/s/68442/ -- License: Creative Commons 0
let piano_e = require('../audio/piano_e.wav');
// Piano E.wav by pinkyfinger -- https://freesound.org/s/68443/ -- License: Creative Commons 0
let piano_f = require('../audio/piano_f.wav');
// Piano F.wav by pinkyfinger -- https://freesound.org/s/68446/ -- License: Creative Commons 0
let piano_fsharp = require('../audio/piano_fsharp.wav');
// Piano F#.wav by pinkyfinger -- https://freesound.org/s/68445/ -- License: Creative Commons 0
let piano_g = require('../audio/piano_g.wav');
// Piano G.wav by pinkyfinger -- https://freesound.org/s/68448/ -- License: Creative Commons 0
let piano_gsharp = require('../audio/piano_gsharp.wav');
// Piano G#.wav by pinkyfinger -- https://freesound.org/s/68447/ -- License: Creative Commons 0
let cello_a2 = require('../audio/cello_a2.wav');
// 10_cello_A2.wav by flcellogrl -- https://freesound.org/s/195275/ -- License: Attribution 4.0
let cello_b2 = require('../audio/cello_b2.wav');
// 12_cello_B2.wav by flcellogrl -- https://freesound.org/s/195273/ -- License: Attribution 4.0
let cello_c2 = require('../audio/cello_c2.wav');
// 1_cello_C2.wav by flcellogrl -- https://freesound.org/s/195272/ -- License: Attribution 4.0
let cello_d2 = require('../audio/cello_d2.wav');
// 3_cello_D2.wav by flcellogrl -- https://freesound.org/s/195277/ -- License: Attribution 4.0
let cello_e2 = require('../audio/cello_e2.wav');
// 5_cello_E2.wav by flcellogrl -- https://freesound.org/s/195281/ -- License: Attribution 4.0
let cello_f2 = require('../audio/cello_f2.wav');
// 6_cello_F2.wav by flcellogrl -- https://freesound.org/s/195280/ -- License: Attribution 4.0
let cello_f2_gb2 = require('../audio/cello_f2_gb2.wav');
// 7_cello_F#2_Gb2.wav by flcellogrl -- https://freesound.org/s/195283/ -- License: Attribution 4.0
let cello_g2 = require('../audio/cello_g2_openstring.wav');
// 8_cello_G2_openstring.wav by flcellogrl -- https://freesound.org/s/195284/ -- License: Attribution 4.0
let cello_g2_ab2 = require('../audio/cello_g2_ab2.wav');
// 9_cello_G#2_Ab2.wav by flcellogrl -- https://freesound.org/s/195285/ -- License: Attribution 4.0
let alto_sax_c4 = require('../audio/alto_sax_c4.wav');
// Alto Sax c4.wav by clruwe -- https://freesound.org/s/119181/ -- License: Attribution 4.0
let alto_sax_eb4 = require('../audio/alto_sax_eb4.wav');
// Alto Sax eb4.wav by clruwe -- https://freesound.org/s/119183/ -- License: Attribution 4.0
let alto_sax_growl_gb4 = require('../audio/alto_sax_growl_gb4.wav');
// Alto Sax 2 growl gb4.wav by clruwe -- https://freesound.org/s/119311/ -- License: Attribution 4.0
let tenor_sax_d4 = require('../audio/tenor_sax_d4.wav');
// Tenor Sax d4.wav by clruwe -- https://freesound.org/s/121427/ -- License: Attribution 4.0
let kora = require('../audio/kora.wav');
// 20111203_Kora_01.wav by dobroide -- https://freesound.org/s/136576/ -- License: Attribution 4.0
let violinopenstrings = require('../audio/violinopenstrings.wav');
// violin.open.strings.chords.wav by dobroide -- https://freesound.org/s/4503/ -- License: Attribution 4.0
let ebfsharp = require('../audio/ebfsharp.mp3');
// EBF#.mp3 by dobroide -- https://freesound.org/s/5741/ -- License: Attribution 4.0
let harp_c5 = require('../audio/harp_c5.wav');
// Harp C5.wav by Shōtotsu -- https://freesound.org/s/689479/ -- License: Creative Commons 0
let maraca_shake = require('../audio/maraca_shake.wav');
// Maraca shake.wav by xtrgamr -- https://freesound.org/s/257781/ -- License: Attribution 4.0
let kualalumpur_intl = require('../audio/kualalumpur_intl.wav');
// kualalumpur international.wav by milton. -- https://freesound.org/s/81159/ -- License: Attribution NonCommercial 3.0
let crash = require('../audio/crash.wav');
// Crash sample with 2012-MacbookPro by MaciaAC -- https://freesound.org/s/576656/ -- License: Creative Commons 0
let clarinet_d6 = require('../audio/clarinet_d6.wav');
// Clarinet - D6
// by MTG -- https://freesound.org/s/248668/ -- License: Attribution 3.0
let acousticstrum = require('../audio/acousticstrum.wav');
//  valcoustclean.wav by NoiseCollector -- https://freesound.org/s/2841/ -- License: Attribution 3.0

// Available but not in use:
// let tambourene = require('../audio/tambourene.wav');
// //  tambourene.wav by Jimmy60 -- https://freesound.org/s/33368/ -- License: Sampling+

export const TrainAudioMap: Record < Route, HTMLAudioElement > = {
  [Route.ONE]: new Audio(cello_a2),
  [Route.TWO]: new Audio(cello_b2),
  [Route.THREE]: new Audio(cello_c2),
  [Route.FOUR]: new Audio(cello_d2),
  [Route.FIVE]: new Audio(cello_e2),
  [Route.SIX]: new Audio(cello_f2),
  [Route.SIXX]: new Audio(cello_f2_gb2),
  [Route.SEVEN]: new Audio(cello_f2_gb2),
  [Route.SEVENX]: new Audio(cello_g2),
  [Route.A]: new Audio(piano_a),
  [Route.B]: new Audio(piano_b),
  [Route.C]: new Audio(piano_c),
  [Route.D]: new Audio(piano_d),
  [Route.E]: new Audio(piano_e),
  [Route.F]: new Audio(piano_f),
  [Route.FS]: new Audio(piano_fsharp), // Franklin Ave S
  [Route.FX]: new Audio(piano_g), // Franklin Ave S
  [Route.G]: new Audio(piano_gsharp),
  [Route.GS]: new Audio(cello_g2_ab2), // Grand Central - Times Square S
  [Route.H]: new Audio(harp_c5), // Far Rockaway S
  [Route.J]: new Audio(alto_sax_eb4),
  [Route.L]: new Audio(alto_sax_c4),
  [Route.M]: new Audio(maraca_shake),
  [Route.N]: new Audio(violinopenstrings),
  [Route.Q]: new Audio(kora),
  [Route.R]: new Audio(ebfsharp),
  [Route.S]: new Audio(kualalumpur_intl),
  [Route.SF]: new Audio(cello_f2_gb2), // Franklin Ave S
  [Route.SI]: new Audio(crash), // Staten Island Rail
  [Route.SIR]: new Audio(clarinet_d6), // Staten Island Rail
  [Route.SR]: new Audio(harp_c5), // Far Rockaway S
  [Route.SS]: new Audio(acousticstrum), // Staten Island Rail
  [Route.W]: new Audio(alto_sax_growl_gb4),
  [Route.Z]: new Audio(tenor_sax_d4),
};
