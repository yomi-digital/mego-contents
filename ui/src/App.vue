<template>
    <div id="app">
        <div class="tutorial_container" v-if="tutorialStep > -1">
            <div class="close-group">
                <p>watch later</p>
                <img src="./assets/images/close-icon.svg" alt="Close" @click="tutorialStep = -1">
            </div>
            <div class="tutorial_box" calc_props></div>
            <p v-html="tutorialMessage"></p>
            <!--<img src="./assets/images/home-arrow.svg" class="next_step" alt="Next step"
                @click="nextStep"> -->
        </div>
        <div class="app_loading" v-if="checking">
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;"
                class="fa-spin" />
        </div>
        <div class="modal_container" v-if="modals.cannot_mint">
            <div class="modal">
                <img src="./assets/images/close-icon.svg" alt="Close" @click="modals.cannot_mint = false">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation"
                    style="font-size:30px;color: #ff850f;margin:0 0 .5rem 0" />
                <h2>Plan suspended</h2>
                <div v-if="subscription > 0">
                    <p>Your subscription expired on the {{ new Date(new Date(new Date().setDate(new Date(registration_timestamp).getDate())).setMonth(new Date().getMonth() - 1)).toLocaleString() }}.</p>
                    <p>Please make a new payment to renew the month</p>
                    <b-button type="button" class="button-dark is-light mx-3 mt-5"
                        style="background:#111!important;color:white!important"
                        @click="$router.push({ name: 'Pricing' })">
                        MANAGE PLAN
                    </b-button>
                </div>
                <div v-if="subscription === 0">
                    <p>With your Free plan, you could mint max {{ free_limit }} times</p>
                    <p>Upgrade your plan to mint unlimited times!</p>
                    <b-button type="button" class="button-dark is-light mx-3 mt-5"
                        style="background:#111!important;color:white!important"
                        @click="$router.push({ name: 'Pricing' })">
                        MANAGE PLAN
                    </b-button>
                </div>
            </div>
        </div>
        <div style="width:100vw;min-height:100vh;height: fit-content;"
            v-if="!mobile && ((account && !checking) || $route.name === 'Share')">
            <Navbar :account="account" :instances="instances" :instance="instance"
                :subscriptionAlert="(subscription === 0 && !canMint) || (subscription > 0 && !isSubscriptionActive)"
                @initTutorial="tutorialStep = 0" :chains="chains" :chain="chain" @chooseChain="chooseChain($event)" />
            <router-view />
        </div>
        <div v-if="mobile || (!account && !checking && $route.name !== 'Share')" class="connect_wallet">
            <div class="choose_chain_modal" v-if="!mobile && modals.choose_chain">
                <h1 class="is-size-3">Select your preferred chain</h1>
                <p class="is-size-5 mt-2">You can change it later</p>
                <div>
                    <div class="chain" @click="chooseChain('mumbai')">
                        <img src="./assets/images/matic-logo.svg" style="width:80px;translate: 0 -12px"
                            alt="Matic chain">
                        <p style="translate: 0 -25px">Mumbai</p>
                    </div>
                    <div class="chain" @click="chooseChain('goerli')">
                        <font-awesome-icon icon="fa-brands fa-ethereum"
                            style="font-size: 55px;color: #126cff;translate: 0 0;margin-right: 2px;" />
                        <p>Goerli</p>
                    </div>
                </div>
            </div>
            <p class="is-size-5 has-text-white has-text-centered" style="padding: 5rem 0" v-if="!mobile">Please connect
                your wallet:</p>
            <img src="./assets/images/home-group-logo.svg" class="connect_img" alt="Mego Contents">
            <h1 v-if="mobile"
                style="color:white;position:absolute;top:70%;left:50%;width:80vw;font-size:20px;text-align:center;transform: translate(-50%,-50%);font-family: 'Sk-Modernist';">
                Please, access from desktop</h1>
            <div class="connect_footer">
                <b-button type="button button-light is-dark mx-auto" class="button" style="margin-bottom:5rem"
                    v-if="!checking && !mobile" @click="connect">CONNECT WALLET</b-button>
                <div>
                    <h2>YOU, ON THE METAVERSE</h2>
                    <div v-if="!mobile">
                        <img src="./assets/images/home-arrow.svg" class="connect_img" alt="Go to mego">
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
import chains from "./costants/chains";
export default {
    name: "Home",
    data() {
        return {
            chains: chains,
            infuraId: process.env.VUE_APP_INFURA_ID,
            umiUrl: process.env.VUE_APP_UMI_API,
            network: -1,
            axios: axios,
            abi: abi,
            contract: '',
            account: "",
            instance: "",
            web3: {},
            instances: [],
            checking: false,
            isWorking: false,
            workingMessage: "",
            newInstanceName: "",
            newInstanceTicker: "",
            mobile: window.matchMedia('(max-width:767px)').matches,
            subscription: -1,
            isSubscriptionActive: true,
            canMint: true,
            free_limit: 0,
            modals: {
                cannot_mint: false,
                choose_chain: false
            },
            tutorialStep: -1,
            tutorialLoading: false,
            tutorialMessage: '',
            tutorialEdit: false,
            chain: ''
        };
    },
    watch: {
        '$route': {
            handler: function (route) {
                //updating instance selected
                this.instance = localStorage.getItem('instance')
                Object.keys(this.modals).forEach(modal => {
                    this.modals[modal] = false
                })
                if (route.name === 'Drafts' || route.name === 'Public') {
                    document.getElementById('navbar_group').children[1].style.background = 'white'
                    document.getElementById('app').style.background = 'white'
                }
                this.subscriptionCheck(route)
            },
            deep: true,
            immediate: true
        },
        tutorialStep: {
            handler() {
                const app = this
                //resetting elements or modals if opened
                if (document.getElementById('close_createIntanceModal') && app.tutorialStep === 0) {
                    document.getElementById('close_createIntanceModal').click()
                }
                if (document.querySelector('.view_datatypes_btn') && app.tutorialStep === 0 && !app.tutorialEdit) {
                    document.querySelector('.view_datatypes_btn').click()
                }
                if (app.tutorialStep !== -1) {
                    let rerender = setInterval(() => {
                        try { app.initTutorial(); clearInterval(rerender) }
                        catch { console.log('.') }
                    }, 50)
                }
            }
        }
    },
    async mounted() {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (_chainId) => {
                let chain = Object.keys(this.chains).find(el => this.chains[el].network === parseInt(_chainId));
                if(chain) {
                    localStorage.setItem('chain', chain)
                    window.location.reload()
                }
            });
        }
        //Assignign default or selected chain
        this.chain = localStorage.getItem('chain')
        if (!this.chain) {
            this.modals.choose_chain = true
        }
        else {
            localStorage.setItem('chain', this.chain)
            localStorage.setItem('chains', JSON.stringify(this.chains))
            this.contract = chains[this.chain].contract
            this.network = chains[this.chain].network

            if (this.$route.name !== 'Share') {
                await this.connect();
                if (this.$route.name === 'Home' && this.instances.length > 0) {
                    this.$router.push({ name: 'Instances' })
                }
                else if (this.instances.length === 0 && this.$route.name !== 'Instances') {
                    this.$router.push({ name: 'Instances' })
                }
                //instance selected check
                if (localStorage.getItem('instance') == null && this.$route.name !== 'Pricing') {
                    if (this.$route.name !== 'Instances') {
                        this.$router.push({ name: 'Instances' })
                    }
                }
            }
            else {
                if (localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
                    await this.connect()
                }
            }
            await this.subscriptionCheck(this.$route)
            if (localStorage.getItem('tutorial') == null && this.account) {
                localStorage.setItem('tutorial', 1)
                this.tutorialStep = 0
            }
            //assigning click events to trigger initTutorial method
            let tempInterval = setInterval(() => {
                if (document.getElementById('initEditTutorialBtn')) {
                    document.getElementById('initEditTutorialBtn').addEventListener('click', () => {
                        this.tutorialStep = 0
                        this.tutorialEdit = true
                        clearInterval(tempInterval)
                    })
                }
            }, 1000)
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
            app.web3 = web3
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
                    try {
                        await app.web3.currentProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: Web3.utils.toHex(app.chains[app.chain].network) }],
                        });
                        location.reload()
                    } catch {
                        alert("Error during switching " + app.chain + " network")
                    }
                }
            }
            catch (e) {
                app.checking = false;
                //alert(e.message);
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
        async subscriptionCheck(route) {
            const app = this
            if (app.account) {
                const factoryContract = new app.web3.eth.Contract(
                    app.abi,
                    app.contract
                );
                app.subscription = parseInt(await factoryContract.methods.subscriptions(app.account).call())
                localStorage.setItem('subscription', app.subscription)
                if (app.subscription === 0) {
                    let free_mints = await factoryContract.methods.free_mints(app.account).call()
                    app.free_limit = await factoryContract.methods.free_limit().call()
                    app.canMint = (app.free_limit - free_mints === 0) ? false : true
                }
                else {
                    app.isSubscriptionActive = (app.subscription === 0) ? true : await factoryContract.methods.isSubscriptionActive(app.account).call()
                    app.registration_timestamp = Number(await factoryContract.methods.registration_timestamps(app.account).call()) * 1000
                }
                if ((app.subscription === 0 && !app.canMint) || (app.subscription > 0 && !app.isSubscriptionActive)) {
                    //Cannot mint
                    if ((route.name === 'New' || route.name === 'Instances')) {
                        app.modals.cannot_mint = true
                    }
                    if (localStorage.getItem('canMint') == null) {
                        localStorage.setItem('canMint', false)
                    }
                    //listeners to show plan suspended modal
                    if (document.querySelector('.create_instance_btn')) {
                        document.querySelector('.create_instance_btn').addEventListener('click', () => {
                            app.modals.cannot_mint = true
                        })
                    }
                }
                else if ((app.subscription > 0 && app.isSubscriptionActive) || (app.subscription === 0 && app.canMint)) {
                    if (localStorage.getItem('canMint') != null) {
                        localStorage.removeItem('canMint')
                    }
                }
            }
        },
        initTutorial() {
            const app = this
            if (!app.tutorialLoading && app.account) {
                try {
                    app.tutorialLoading = true
                    let paddingSelection = 35 //in pixels
                    let box = document.querySelectorAll('[calc_props]')[0]
                    let target
                    if (app.$route.name === 'Instances') {
                        if (app.tutorialStep === 0) {
                            target = document.getElementsByClassName('create_instance_btn')[0]
                            app.tutorialMessage = 'Create a new <b>instance</b> or manage an existing one. It will contain all of your datatypes (product, blog, menu, ...) and contents (blog articles, products, menu links)'
                        }
                        else if (app.tutorialStep === 1) {
                            target = document.getElementsByClassName('instance_name')[0]
                            app.tutorialMessage = 'Insert the <b>instance name</b> that refers to a website for example.'
                        }
                        else if (app.tutorialStep === 2) {
                            target = document.getElementsByClassName('instance_ticker')[0]
                            app.tutorialMessage = 'A <b>ticker</b> symbol is the short combination of letters that is used to represent your instance.'
                        }
                        else {
                            app.tutorialStep = -1
                        }
                    }
                    else if (app.$route.name === 'Instance' && !app.tutorialEdit && localStorage.getItem('isOwner')) {
                        if (app.tutorialStep === 0) {
                            target = document.getElementsByClassName('add_new_datatype_btn')[0]
                            app.tutorialMessage = 'A <b>datatype</b> is required before the creation of contents in order to tell the system wich properties the nft will have'
                        }
                        else if (app.tutorialStep === 1) {
                            target = document.querySelectorAll('.tab')[0]
                            app.tutorialMessage = "Take a look at the our pre-compiled datatypes ready to be added! <br /> You can add a datatype by clicking the <b style='font-size:25px'>+</b> icon"
                        }
                        else if (app.tutorialStep === 2) {
                            target = document.querySelectorAll('.tab')[1]
                            app.tutorialMessage = "Or you could create your <b>customized</b> one!"
                        }
                        else {
                            app.tutorialStep = -1
                        }
                    }
                    else if (app.$route.name === 'Instance' && !app.tutorialEdit && !localStorage.getItem('isOwner')) {
                        if (app.tutorialStep === 0) {
                            target = document.getElementById('collaborator_notice')
                            document.querySelector('.tutorial_container > p').style.width = '515px'
                            app.tutorialMessage = 'This instance is owned by <b>' + localStorage.getItem('owner') + `</b> and you have been added in its collaborators. You cannot edit any contents of the contract but you can create new content at the <a style="color:black;text-decoration:underline;font-weight:700" onclick="location.href = '` + location.href.split('#')[0] + `#/new'` + `; location.reload()">new</a> page!`
                        }
                        else {
                            app.tutorialStep = -1
                        }
                    }
                    else if (app.$route.name === 'Instance' && app.tutorialEdit) {
                        paddingSelection = 2
                        if (app.tutorialStep === 0) {
                            target = document.querySelectorAll('table th')[0]
                            app.tutorialMessage = 'Tha <b>active</b> column tells the system wich properties of your content should be visible or not during update and publication'
                        }
                        else if (app.tutorialStep === 1) {
                            target = document.querySelectorAll('table th')[1]
                            app.tutorialMessage = 'The <b>name</b> column decides how name a specific field of your content. <br />For example a product may have a <i>name, description and price</i>'
                        }
                        else if (app.tutorialStep === 2) {
                            target = document.querySelectorAll('table th')[3]
                            app.tutorialMessage = 'The <b>required</b> column specifics id a field of your content cannot be empty during update'
                        }
                        else if (app.tutorialStep === 3) {
                            target = document.querySelectorAll('table th')[4]
                            app.tutorialMessage = 'The <b>type</b> column sets the input type for that field content'
                        }
                        else if (app.tutorialStep === 4) {
                            target = document.querySelectorAll('table th')[5]
                            app.tutorialMessage = "The <b>multiple</b> column establishes if that field input should make you upload more than one file, or select more than one option in a select.<br> It can only be activated for input type <i style='color:red'>select</i> or <i style='color:red'>file</i>"
                        }
                        else if (app.tutorialStep === 5) {
                            target = document.querySelectorAll('table th')[5]
                            app.tutorialMessage = "The <b>multiple</b> column establishes if that field input should make you upload more than one file, or select more than one option in a select.<br> It can only be activated for input type <i style='color:red'>select</i> or <i style='color:red'>file</i>"
                        }
                        else if (app.tutorialStep === 6) {
                            target = document.querySelectorAll('table th')[6]
                            app.tutorialMessage = "With the <b>html</b> column enabled, you can write also HTML code inside that field. It can only be activated for input type <i style='color:red'>textarea</i>"
                        }
                        else if (app.tutorialStep === 7) {
                            target = document.querySelectorAll('table th')[7]
                            app.tutorialMessage = "In the <b>select options</b> input you have to specify at least one option for your select.<br />You can add options writing a <i>comma</i> or pressing <i>enter</i><br /> It can only be used for input type <i style='color:red'>select</i>"
                        }
                        else if (app.tutorialStep === 8) {
                            target = document.querySelectorAll('table th')[8]
                            app.tutorialMessage = "By clicking the trash icon you will be asked of <b>deleting</b> that field"
                        }
                        else {
                            app.tutorialStep = -1
                        }
                    }
                    app.tutorialLoading = false
                    if (target) {
                        let rect = target.getBoundingClientRect()
                        box.style.left = (rect.left + window.scrollX) - 8 - (paddingSelection / 2) + 'px'
                        box.style.top = (rect.top + window.scrollY) - 4 - (paddingSelection / 2) + 'px'
                        box.style.width = target.clientWidth + paddingSelection + 'px'
                        box.style.height = target.clientHeight + paddingSelection + 'px'
                        let listenerF = () => {
                            target.click()
                            app.tutorialStep++
                            setTimeout(() => {
                                app.tutorialLoading = false
                                //box.removeEventListener('click', listenerF, true)
                                document.querySelector('.tutorial_container')?.removeEventListener('click', listenerF, true)
                            }, 200)
                        }
                        //box.addEventListener('click', listenerF, true)
                        document.querySelector('.tutorial_container').addEventListener('click', listenerF, true)
                    }
                }
                catch (e) {
                    console.log(e)
                }
            }
        },
        chooseChain(chain) {
            if (this.chain !== chain && localStorage.getItem('chain')) {
                localStorage.removeItem('chain')
                localStorage.setItem('chain', chain)
                location.reload()
            }
            else {
                localStorage.setItem('chain', chain)
                location.reload()
            }
        }
    },
    components: { Navbar }
};
</script>
