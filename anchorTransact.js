const holder = {
    name: "",
    miner_count: 0
};

let holderArray = [];

keyType = '';


// app identifier, should be set to the eosio contract account if applicable
const identifier = 'example'
// initialize the browser transport
const transport = new AnchorLinkBrowserTransport()
// initialize the link
const link = new AnchorLink({
    transport,
    chains: [{
        chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
        nodeUrl: 'https://wax.greymass.com',
    }]
})
// the session instance, either restored using link.restoreSession() or created with link.login()
let session

// tries to restore session, called when document is loaded
function restoreSession() {
    link.restoreSession(identifier).then((result) => {
        session = result
        if (session) {
            didLogin()
        }
    })
}

// login and store session if sucessful
function login() {
    link.login(identifier).then((result) => {

        console.log(result);
        keyType = result.payload.sp;

        getHolders();

        session = result.session
        didLogin()
    })
}

// logout and remove session from storage
function logout() {
    document.body.classList.remove('logged-in')
    session.remove()
}

// called when session was restored or created
function didLogin() {
    document.getElementById('account-name').textContent = session.auth.actor
    document.body.classList.add('logged-in')
}


async function sign() {
    console.log('SIGN');

    try {

        var form_amount = document.getElementById("formLiftiumAmount");
        let liftium_amount = parseInt(form_amount.form.liftiumAmount.value, 10);

        for (let i = 0; i < holderArray.length; i++) {

            console.log('SENT');
            let amount_sent = ((holderArray[i].miner_count * liftium_amount).toFixed(4)).toString();

            let text1 = amount_sent;
            let text2 = "LIFTIUM";
            let total_sent = text1.concat(" ", text2);
            console.log(total_sent);

            const result = await link.transact({
                actions: [{
                    account: 'tokenizednft',
                    name: 'transfer',
                    authorization: [{
                        actor: session.auth.actor,
                        permission: keyType,
                    }],
                    data: {
                        from: session.auth.actor,
                        to: holderArray[i].name,
                        quantity: total_sent,
                        memo: 'MinerStonksz Rewards!!'
                    },
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            });
            //document.getElementById('response').append(JSON.stringify(result, null, 2));

        }

    } catch (e) {
        // document.getElementById('response').append(e.message);
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