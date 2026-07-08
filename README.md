# World of Warships Collection Calculator ⚓

The goal of this project is to help players estimate how many containers
they may need to complete a World of Warships collection. Rather than
relying on simple averages, the calculator uses Monte Carlo simulations
to produce a realistic expectation range while accounting for duplicate
collection mechanics.

> \[!NOTE\] This calculator is intended as an estimation tool. Container
> drops are random, so your actual results may be better or worse than
> the estimate.

> \[!TIP\] The calculator intentionally presents a **50%--90% expected
> range**. The lower end represents a typical outcome, while the upper
> end provides a more conservative expectation for players who want to
> avoid underestimating the number of containers they'll need.

## Features

-   [x] Monte Carlo simulation
-   [x] Duplicate token conversion support
-   [x] Existing collection progress
-   [x] Existing collection tokens
-   [x] Duplicate progress tracking
-   [x] Configurable collection sizes
-   [x] Optional container cost calculation
-   [x] Best and worst case reference values
-   [x] Simulation timing display
-   [ ] Tells RNGesus to be nice to you

## Quick Start

1.  Open the calculator in your browser.
2.  Enter your collection information.
3.  Click **Calculate Estimate**.
4.  Review the expected container range and optional cost estimate.

## Usage

### Collection Size

The total number of unique elements in the collection.

### Elements Collected

The number of unique collection elements you already own.

### Collection Tokens

Completed tokens that can immediately be exchanged for missing
collection elements.

### Duplicate Rate

The number of duplicate elements required to create a new collection
token.

### Duplicates

Your current progress toward your next collection token.

### Elements Per Container

How many collection elements each container awards.

### Container Cost

Optional. If provided, the calculator estimates the expected cost range
in Coal or Doubloons.

## How the Estimate Works

The calculator performs a large number of simulated collection
completions using the current inputs. Rather than immediately spending
collection tokens, it assumes an optimal strategy where tokens are saved
until enough have accumulated to complete the remaining collection.

The displayed **Expected Containers** range is based on the 50th and
90th percentiles of the simulation results, giving both a typical
outcome and a conservative expectation.

## Examples

A brand new 16-element collection:

    Collection Size: 16
    Elements Collected: 0
    Collection Tokens: 0
    Duplicate Rate: 4
    Duplicates: 0
    Elements Per Container: 1

## Hosting

This project is a completely static HTML, CSS, and JavaScript
application and can be hosted using GitHub Pages or any standard web
server. No backend is required.

## Issues

This project was created primarily as a personal utility and shared
because I think other players may find it useful.

If you discover an issue affecting the accuracy of the calculations,
feel free to open an issue. Suggestions are welcome, though I may not
implement every feature request.

## Contribution

If you'd like to experiment or customize the calculator for your own
use, feel free to fork the project and make it your own. If you improve
the simulation or discover a mathematical edge case, I'd love to hear
about it. 😊
