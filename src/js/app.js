App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',


  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("MyToken.json", function(myToken) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.MyToken = TruffleContract(myToken);
      // Connect provider to interact with contract
      App.contracts.MyToken.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.MyToken.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.transaction({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var myTokenInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    var accountAddress;
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        accountAddress = account;
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.MyToken.deployed().then(function(instance) {
      myTokenInstance = instance;
      return myTokenInstance.getBalance();
    }).then(function(balance) {
      var balances = $("#balances");
      balances.empty();
      var balaceTemplate = "<tr><th>" + accountAddress + "</th><td>" + balance + "</td></tr>"
          balances.append(balaceTemplate);
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  sendMoney: function() {
    var toaddress = $('#toaddress').val();
    var amountTokens = $('#amount').val();
    App.contracts.MyToken.deployed().then(function(instance) {
      return instance.transfer(toaddress, amountTokens, { from: App.account });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
  getGems: function() {
    var targetAddress = $('#targetAddress').val();
    App.contracts.MyToken.deployed().then(function(instance) {
      return instance.getAccountGems(targetAddress, { from: App.account });
    }).then(function(result) {
      alert(result);
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
