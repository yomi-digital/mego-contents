const chains = {
  ethereum: {
    network: 1,
    contract: '',
    explorer: 'https://etherscan.io',
    opensea: 'https://opensea.io/assets/ethereum',
    coin: 'ether'
  },
  goerli: {
    network: 5,
    contract: '0x060597953d285Cf9e59197e6C797bbD2256Ba672',
    explorer: 'https://goerli.etherscan.io',
    opensea: 'https://testnets.opensea.io/assets/goerli',
    coin: 'ether'
  },
  polygon: {
    network: 137,
    contract: '',
    explorer: 'https://polygonscan.com',
    opensea: '',
    coin: 'MATIC'
  },
  mumbai: {
    network: 80001,
    contract: '0x604b69edA6AB9778272c5e0C9B34A2acDeae116d',
    explorer: 'https://mumbai.polygonscan.com',
    opensea: 'https://testnets.opensea.io/assets/mumbai',
    coin: 'MATIC'
  }
}

export default chains