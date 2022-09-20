<template>
    <div id="pricing">
        <div class="plans_container">
            <div class="plan">
                <h1>FREE</h1>
                <h2>0.0 ether</h2>
                <i>0.0 / month</i>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
                <ul>
                    <li>Mint max 5 times</li>
                    <li>0.2 ether to deploy an instance</li>
                </ul>
                <b-button type="button" class="button-dark is-light mx-3 mt-5"
                    style="background:#111!important;color:white!important">
                    BUY
                </b-button>
            </div>
            <div class="plan">
                <h1>UNLIMITED</h1>
                <h2>0.3 ether</h2>
                <i>0.01 / month</i>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
                <ul>
                    <li>Mint unlimited times</li>
                    <li>0.05 ether to deploy an instance</li>
                </ul>
                <b-button type="button" class="button-dark is-light mx-3 mt-5"
                    style="background:#111!important;color:white!important">
                    BUY
                </b-button>
            </div>
            <div class="plan">
                <h1>PREMIUM</h1>
                <h2>0.15 ether</h2>
                <i>0.025 / month</i>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
                <ul>
                    <li>Mint unlimited times</li>
                    <li>0.15 ether to deploy an instance</li>
                </ul>
                <b-button type="button" class="button-dark is-light mx-3 mt-5"
                    style="background:#111!important;color:white!important">
                    BUY
                </b-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Pricing',
    mounted() {
        document.getElementById('app').style.background = '#EDEDED'
        document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
    }
}
</script>