const holder = {
    name: "",
    miner_count: 0
};

let holderArray = [];

let keyType = '';


const wax = new waxjs.WaxJS({
    rpcEndpoint: 'https://wax.greymass.com'
});

//automatically check for credentials
autoLogin();

//checks if autologin is available 
async function autoLogin() {
    let isAutoLoginAvailable = await wax.isAutoLoginAvailable();
    if (isAutoLoginAvailable) {
        let userAccount = wax.userAccount;
        let pubKeys = wax.pubKeys;
        let str = 'AutoLogin enabled for account: ' + userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
        document.getElementById('autologin').insertAdjacentHTML('beforeend', str);
    } else {
        document.getElementById('autologin').insertAdjacentHTML('beforeend', 'Not auto-logged in');
    }
}

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
    try {
        //if autologged in, this simply returns the userAccount w/no popup
        let userAccount = await wax.login();
        let pubKeys = wax.pubKeys;
        let str = 'Account: ' + userAccount + '<br/>Active: ' + pubKeys[0] + '<br/>Owner: ' + pubKeys[1]
        document.getElementById('loginresponse').insertAdjacentHTML('beforeend', str);
        //getWallet(userAccount);
        getHolders();

    } catch (e) {
        document.getElementById('loginresponse').append(e.message);
    }
}

async function sign() {
    if (!wax.api) {
        return document.getElementById('response').append('* Login first *');
    }

    try {

        var form_amount = document.getElementById("formLiftiumAmount");
        let liftium_amount = parseInt(form_amount.form.liftiumAmount.value, 10);

        for (let i = 0; i < holderArray.length; i++) {

            let amount_sent = ((holderArray[i].miner_count * liftium_amount).toFixed(4)).toString();

            let text1 = amount_sent;
            let text2 = "LIFTIUM";
            let total_sent = text1.concat(" ", text2);
            console.log(total_sent);





            const result = await wax.api.transact({
                actions: [{
                    account: 'tokenizednft',
                    name: 'transfer',
                    authorization: [{
                        actor: wax.userAccount,
                        permission: 'active',
                    }],
                    data: {
                        from: wax.userAccount,
                        to: holderArray[i].name,
                        quantity: total_sent,
                        memo: 'MinerStonksz Rewards!!'
                    },
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            });
            document.getElementById('response').append(JSON.stringify(result, null, 2));
        }

    } catch (e) {
        document.getElementById('response').append(e.message);
    }
}




async function fetchStonkszHoldersJSON() {
    const response = await fetch('https://wax.api.atomicassets.io/atomicassets/v1/accounts?template_id=516244&page=1&limit=100&order=desc');

    const holders = await response.json();

    return holders;

}



async function getHolders() {


    let count = 0;


    await fetchStonkszHoldersJSON().then(stonksz_holders => {

        stonksz_holders.data.forEach((element, index) => {
            if (element.account != 'upliftminers') {

                const holder_temp = Object.create(holder);

                holder_temp.name = element.account;

                holder_temp.miner_count = element.assets;

                holderArray[count] = holder_temp;
                count += 1;
            }

        });
        console.log(holderArray);
    });



}