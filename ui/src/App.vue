<template>
    <div id="app">
        <div class="app_loading" v-if="checking">
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;"
                class="fa-spin" />
        </div>
        <div style="width:100vw;min-height:100vh;height: fit-content;"
            v-if="!mobile && ((account && !checking) || $route.name === 'Share')">
            <Navbar :account="account" :instances="instances" />
            <router-view />
        </div>
        <div v-if="account && !checking && instance.length === 0 && !mobile && false"
            style="padding: 30vh 30%; text-align: center">
            <h1 class="title is-2">MEGO Contents</h1>
            In order to create contents you must create an new contract where your
            contents will be stored. This contract will be owned by you of course and
            you'll be able to see it on OpenSea.<br />Each new deploy costs 0.05 rETH,
            in any instance you can mint an unlimited amount of contents for free,
            you'll pay only for gas fees.<br /><br />
            <span style="color: #f00">Please note we're in Rinkeby network, data are not stored
                permanently.</span><br /><br />
            <b-input v-model="newInstanceName" placeholder="New instance name" /><br />
            <b-input v-model="newInstanceTicker" placeholder="New instance ticker" /><br />
            <b-button expanded v-if="!isWorking" @click="deploy">DEPLOY FIRST CONTRACT</b-button>
            <br /><br />
            <div v-if="isWorking">{{ workingMessage }}</div>
        </div>
        <div v-if="mobile || (!account && !checking && $route.name !== 'Share')" class="connect_wallet">
            <p class="is-size-5 has-text-white has-text-centered" style="padding: 5rem 0" v-if="!mobile">Please connect
                your wallet:</p>
            <img src="./assets/images/home-group-logo.svg" alt="Mego Contents">
            <h1 v-if="mobile"
                style="color:white;position:absolute;top:70%;left:50%;width:80vw;font-size:20px;text-align:center;transform: translate(-50%,-50%);font-family: 'Sk-Modernist';">
                Please, access from desktop</h1>
            <div>
                <b-button type="button button-light is-dark mx-auto" class="button" style="margin-bottom:5rem"
                    v-if="!checking && !mobile" @click="connect">CONNECT WALLET</b-button>
                <div>
                    <h2>YOU, ON THE METAVERSE</h2>
                    <div v-if="!mobile">
                        <img src="./assets/images/home-arrow.svg" alt="Go to mego">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Web3 from "web3";
import axios from "axios";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "./components/Navbar.vue";
const abi = require("./abis/factory.json");
export default {
    name: "Home",
    data() {
        return {
            infuraId: process.env.VUE_APP_INFURA_ID,
            umiUrl: process.env.VUE_APP_UMI_API,
            network: parseInt(process.env.VUE_APP_CHAIN_ID),
            axios: axios,
            abi: abi,
            contract: process.env.VUE_APP_FACTORY_CONTRACT,
            account: "",
            instance: "",
            instances: [],
            checking: false,
            isWorking: false,
            workingMessage: "",
            newInstanceName: "",
            newInstanceTicker: "",
            mobile: window.matchMedia('(max-width:767px)').matches
        };
    },
    async mounted() {
        if (this.$route.name !== 'Share') {
            await this.connect();
        }
        if (this.$route.name === 'Home' && this.instances.length > 0) {
            this.$router.push({ name: 'Instances' })
        }
        else if (this.instances.length === 0 && this.$route.name !== 'Pricing') {
            this.$router.push({ name: 'Pricing' })
        }
        //instance selected check
        if (localStorage.getItem('instance') == null) {
            if (this.$route.name !== 'Instances' && this.$route.name !== 'Share') {
                this.$router.push({ name: 'Instances' })
            }
        }
    },
    methods: {
        async connect() {
            const app = this;
            const web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions: {
                    walletconnect: {
                        package: WalletConnectProvider,
                        options: {
                            infuraId: app.infuraId,
                        },
                    },
                },
            });
            const provider = await web3Modal.connect();
            const web3 = await new Web3(provider);
            try {
                const network = await web3.eth.net.getId();
                console.log("Found network:", network);
                if (network === app.network) {
                    const accounts = await web3.eth.getAccounts();
                    if (accounts.length > 0) {
                        app.checking = true;
                        const factoryContract = new web3.eth.Contract(app.abi, app.contract);
                        const instances = await factoryContract.methods
                            .instancesOfOwner(accounts[0])
                            .call();
                        app.instances = instances
                        console.log("Deployed instances:", instances);
                        const instanceAddress = instances[0];
                        console.log("Instance exists?", instanceAddress);
                        app.account = accounts[0];
                        if (instanceAddress !== undefined) {
                            app.checking = false;
                            app.instance = instanceAddress;
                        }
                        else {
                            app.checking = false;
                        }
                    }
                    else {
                        alert("No accounts allowed, please retry!");
                    }
                }
                else {
                    alert("Wrong network, please connect to correct one (" +
                        app.network +
                        ")!");
                }
            }
            catch (e) {
                app.checking = false;
                alert(e.message);
            }
        },
        async deploy() {
            const app = this;
            const web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions: {
                    walletconnect: {
                        package: WalletConnectProvider,
                        options: {
                            infuraId: app.infuraId,
                        },
                    },
                },
            });
            const provider = await web3Modal.connect();
            const web3 = await new Web3(provider);
            try {
                const network = await web3.eth.net.getId();
                console.log("Found network:", network);
                if (network === app.network) {
                    app.isWorking = true;
                    app.workingMessage = "Please confirm operation in your wallet..";
                    const nftContract = new web3.eth.Contract(app.abi, app.contract);
                    const deployment_price = await nftContract.methods
                        .deployment_price()
                        .call();
                    const newInstance = await nftContract.methods
                        .startNewInstance(app.newInstanceName, app.newInstanceTicker)
                        .send({ from: app.account, value: deployment_price })
                        .on("transactionHash", (tx) => {
                            app.workingMessage = "Found pending transaction at: " + tx;
                        });
                    console.log("FACTORY_RECEIPT", newInstance);
                    const instanceAddress = await nftContract.methods
                        .instances(app.account)
                        .call();
                    console.log("Instance exists?", instanceAddress);
                    app.isWorking = false;
                    app.instance = instanceAddress;
                }
                else {
                    alert("Wrong network, please connect to correct one (" +
                        app.network +
                        ")!");
                }
            }
            catch (e) {
                app.isWorking = false;
                alert(e.message);
            }
        },
    },
    components: { Navbar }
};
</script>
