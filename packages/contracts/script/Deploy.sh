# Expects jq to be installed

# Run this from the root of the contract dir!!!
# To test this deploy without actually deploy to a public network, remove the "broadcast" flag
# If the verification fails, run this script again and remove the "broadcast" flag
# If you are using Solenv, you must add the "--ffi" flag
# if you get a permission denied error, ensure there is execute permisions on the file.. 755 or similiar

source .env

if [ -z "$CHAIN_ID" ]; then
  echo "CHAIN_ID is not set"
  exit 1
fi

CONTRACT_NAME="ExampleNFT"
DEPLOY_OUTPUT="deploys/$CHAIN_NAME/$CONTRACT_NAME.json"
mkdir -p $(dirname $DEPLOY_OUTPUT)

forge script script/Deploy.s.sol:Deploy -vvvv --chain-id $CHAIN_ID \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    --verify --etherscan-api-key $ETHERSCAN_API_KEY

# Transaction 0 should be the first transaction you broadcast
jq '{deployedTo: .transactions[0].contractAddress, deployer: .transactions[0].tx.from, transactionHash: .transactions[0].hash}' ./broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json > $DEPLOY_OUTPUT
