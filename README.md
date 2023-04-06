# What is this?
This application scans and manages delays for trains and paybacks etc.

---

## Install
````
npm i -g delay-watch
````

## Usage
```bash
➜ delay-watch
Usage: delay-watch [options] [command]

Version: 1.2.6

Options:
  -V, --version         output the version number
  -h, --help            output usage information

Commands:
  run|r [options]       Start the scanner
  config|cfg [options]  Configuration for the application
  payback [options]     The paybacks from the train company
```

---

## Start scanner
```bash
➜ delay-watch scan
Complete [100%] - ████████████████████████████████████████ | [JÖ] - Jönköping C || 0/0 Trains || Time 4s | ETA NULLs
Scanning [52%] - █████████████████████░░░░░░░░░░░░░░░░░░░ | [V] - Värnamo || 11/21 Trains || Time 4s | ETA 4s
Scanning [43%] - █████████████████░░░░░░░░░░░░░░░░░░░░░░░ | [VG] - Vänersborg C || 13/30 Trains || Time 4s | ETA 6s
Scanning [26%] - ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [VB] - Varberg || 10/39 Trains || Time 4s | ETA 13s
Scanning [15%] - ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [HPBG] - Hallsberg || 11/71 Trains || Time 4s | ETA 24s
Scanning [28%] - ███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [THN] - Trollhättan C || 15/54 Trains || Time 4s | ETA 9s
Scanning [16%] - ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [N] - Nässjö C || 13/80 Trains || Time 4s | ETA 20s
Complete [100%] - ████████████████████████████████████████ | [ÖB] - Örebro Södra || 0/0 Trains || Time 4s | ETA NULLs
Scanning [45%] - ██████████████████░░░░░░░░░░░░░░░░░░░░░░ | [BS] - Borås C || 10/22 Trains || Time 4s | ETA 5s
Complete [100%] - ████████████████████████████████████████ | [ÅL] - Åmål || 0/0 Trains || Time 4s | ETA NULLs
Complete [100%] - ████████████████████████████████████████ | [UÖ] - Uddevalla Östra || 0/0 Trains || Time 4s | ETA NULLs
Complete [100%] - ████████████████████████████████████████ | [MDÖ] - Mölndals övre || 0/0 Trains || Time 4s | ETA NULLs
Complete [100%] - ████████████████████████████████████████ | [SMD] - Strömstad || 4/4 Trains || Time 4s | ETA 0s
Complete [100%] - ████████████████████████████████████████ | [ÖR] - Örebro C || 0/0 Trains || Time 4s | ETA NULLs
Scanning [21%] - █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [SK] - Skövde C || 15/70 Trains || Time 4s | ETA 11s
Scanning [34%] - ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ | [UV] - Uddevalla C || 10/29 Trains || Time 4s | ETA 8s
Scanning [44%] - ██████████████████░░░░░░░░░░░░░░░░░░░░░░ | [T] - Töreboda || 8/18 Trains || Time 4s | ETA 6s
Scanning [20%] - ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [MDN] - Mölndal || 20/100 Trains || Time 4s | ETA 15s
Scanning [20%] - ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [KB] - Kungsbacka || 14/69 Trains || Time 4s | ETA 17s
^Canning [8%] - ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ | [G] - Göteborg C || 18/212 Trains || Time 4s | ETA 26s
```

### Output after the scan is completed
```bash
LocationCode [SK] - Skövde C
┌────────────────┬───────┬──────────────────────────────┬───────────────────────────────────────┬───────┬────────────────────────────────────────────────────────────────────────────────┐
│ # Train number │ TRAIN │ FROM                         │ TO                                    │ DELAY │ SJ URL                                                                         │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼────────────────────────────────────────────────────────────────────────────────┤
│ 438            │ SJ    │ 14:24 14:24 - [G] Göteborg C │ 17:29 18:10 - [CST] Stockholm Central │ 40m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/438/Date/2020-02-16 │
└────────────────┴───────┴──────────────────────────────┴───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────┘
Found 1 delayed trains!

LocationCode [THN] - Trollhättan C
┌────────────────┬───────┬──────────────────────────────┬───────────────────────────────────────┬───────┬─────────────────────────────────────────────────────────────────────────────────┐
│ # Train number │ TRAIN │ FROM                         │ TO                                    │ DELAY │ SJ URL                                                                          │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 7034           │ Tågab │ 12:10 12:10 - [G] Göteborg C │ 17:25 18:10 - [CST] Stockholm Central │ 44m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/7034/Date/2020-02-16 │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 397            │ VY    │ 16:25 16:55 - [ED] Ed        │ 17:40 18:10 - [G] Göteborg C          │ 30m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/397/Date/2020-02-16  │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 7035           │ Tågab │ 13:50 13:50 - [FLN] Falun C  │ 19:30 20:20 - [G] Göteborg C          │ 72m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/7035/Date/2020-02-16 │
└────────────────┴───────┴──────────────────────────────┴───────────────────────────────────────┴───────┴─────────────────────────────────────────────────────────────────────────────────┘
Found 3 delayed trains!

LocationCode [G] - Göteborg C
┌────────────────┬───────┬──────────────────────────────┬───────────────────────────────────────┬───────┬─────────────────────────────────────────────────────────────────────────────────┐
│ # Train number │ TRAIN │ FROM                         │ TO                                    │ DELAY │ SJ URL                                                                          │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 7034           │ Tågab │ 12:10 12:10 - [G] Göteborg C │ 17:25 18:10 - [CST] Stockholm Central │ 44m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/7034/Date/2020-02-16 │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 438            │ SJ    │ 14:24 14:24 - [G] Göteborg C │ 17:29 18:10 - [CST] Stockholm Central │ 40m   │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/438/Date/2020-02-16  │
├────────────────┼───────┼──────────────────────────────┼───────────────────────────────────────┼───────┼─────────────────────────────────────────────────────────────────────────────────┤
│ 341            │ SJ    │ 16:04 16:04 - [G] Göteborg C │ 20:16 20:16 - [KAC] Kalmar C          │ 102m  │ https://www2.sj.se/sv/trafikinfo/trafiken-idag.html/search/341/Date/2020-02-16  │
└────────────────┴───────┴──────────────────────────────┴───────────────────────────────────────┴───────┴─────────────────────────────────────────────────────────────────────────────────┘
Found 3 delayed trains!
```

## Show paybacks
```bash
➜ delay-watch payback
┌─────────────────────┬──────────────┬──────────┬─────────┐
│ Datetime            │ Case number  │ Code     │ Payback │
├─────────────────────┼──────────────┼──────────┼─────────┤
│ 2020-02-10 07:46:29 │ 2020VT068995 │ NVLGVGX6 │ 100kr   │
├─────────────────────┼──────────────┼──────────┼─────────┤
│ 2020-02-12 07:47:42 │ 2020VT070805 │ MCADC4S4 │ 250kr   │
├─────────────────────┼──────────────┼──────────┼─────────┤
│ 2020-02-12 09:17:53 │ 2020VT072847 │ BV8UQHZP │ 150kr   │
└─────────────────────┴──────────────┴──────────┴─────────┘
Number of paybacks: 3 | Total payback: 500kr
```

## Show config
```bash
➜ delay-watch config
Config file is located at: /Users/chreng/.delay-watch/config.json
┌───────────────┬─────────────────────────┐
│ Key           │ Value                   │
├───────────────┼─────────────────────────┤
│ ticketNumber  │ 14-1-1-417215143        │
├───────────────┼─────────────────────────┤
│ email         │ youremail@gmail.com     │
├───────────────┼─────────────────────────┤
│ locationCodes │ [CST] Stockholm Central │
│               │ [JÖ] Jönköping C        │
│               │ [N] Nässjö C            │
│               │ [SK] Skövde C           │
│               │ [T] Töreboda            │
│               │ [VG] Vänersborg C       │
│               │ [KS] Karlstad C         │
│               │ [ÅL] Åmål               │
│               │ [G] Göteborg C          │
│               │                         │
└───────────────┴─────────────────────────┘
```