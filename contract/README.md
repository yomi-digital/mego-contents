# Skygolpe Official Contract

[![MythXBadge](https://badgen.net/https/api.mythx.io/v1/projects/954f31f3-834a-417e-b915-aa42e51ee793/badge/data?cache=300&icon=https://raw.githubusercontent.com/ConsenSys/mythx-github-badge/main/logo_white.svg)](https://docs.mythx.io/dashboard/github-badges)


## Requirements

You will need `NodeJS` and `YARN` installed in your machine, if you're ready to start just install dependencies with:

```
yarn
```

## Init local network

To init a new hardhat network you'll need to run:
```
yarn network
```

With this command a new `hardhat.json` file will be created, a new mnemonic will be created (don't use default one in any case) and a new hardhat network will run. Leave this terminal opened and open a new one.

## Deploy contract

To deploy the contract simply run:

```
yarn task deploy hardhat
```

With this command we're saying the `scripts/_task.js` to run the `scripts/deploy.js` file using `configs/hardhat.json` file.

## Run other scripts

As you can easily understand you're now able to write your own scripts (or tests) and use it like:

```
yarn task myscript hardhat
```

or you can change the `hardhat` with `rinkeby` (for instance) and deploy to Rinkeby network. Of course you will need to setup your own `provider` inside the `configs/rinkeby.json` file adding an Alchemy, Infura or whatsoever provider.

## Slither analysis

```
$ slither . --print human-summary
'npx hardhat compile --force' running
Compiling 12 files with 0.8.6
Solidity compilation finished successfully


Compiled with Builder
Number of lines: 101 (+ 1130 in dependencies, + 0 in tests)
Number of assembly lines: 0
Number of contracts: 1 (+ 11 in dependencies, + 0 tests) 

Number of optimization issues: 9
Number of informational issues: 32
Number of low issues: 5
Number of medium issues: 1
Number of high issues: 0


Use: Openzeppelin-Ownable, Openzeppelin-ERC721
ERCs: ERC165, ERC721

+----------+-------------+---------------+------------+--------------+----------+
|   Name   | # functions |      ERCS     | ERC20 info | Complex code | Features |
+----------+-------------+---------------+------------+--------------+----------+
| Skygolpe |      59     | ERC165,ERC721 |            |      No      | Assembly |
+----------+-------------+---------------+------------+--------------+----------+
. analyzed (12 contracts)
Done in 1.18s.
```