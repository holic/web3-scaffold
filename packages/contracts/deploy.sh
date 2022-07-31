# Expects jq to be installed

source .env
source .env.local

if [ -z "$CHAIN_NAME" ]; then
  echo "CHAIN_NAME is not set"
  exit 1
fi

CONTRACT_NAME="DailyCanvas"

DEPLOY_OUTPUT="deploys/$CHAIN_NAME/$CONTRACT_NAME.json"
mkdir -p $(dirname $DEPLOY_OUTPUT)

if [ ! -f $DEPLOY_OUTPUT ] || [ ! -s $DEPLOY_OUTPUT ]; then
  forge create $CONTRACT_NAME --json --rpc-url=$RPC_URL --private-key=$DEPLOYER_PRIVATE_KEY --constructor-args "0x890ac85f2fb2004a8474c5eeb2a4e892b3839a17" | jq . > $DEPLOY_OUTPUT 
fi

CONTRACT_ADDRESS=$(cat $DEPLOY_OUTPUT | jq -r ".deployedTo")
if [ -z $CONTRACT_ADDRESS ]; then
  echo "No contract address found in $DEPLOY_OUTPUT"
  exit 1
fi

echo "Using $CHAIN_NAME contract address: $CONTRACT_ADDRESS"

sleep 10
# cast send --rpc-url=$RPC_URL $CONTRACT_ADDRESS "setBaseTokenURI(string)" "ipfs://somehashgoeshere" --private-key=$DEPLOYER_PRIVATE_KEY

forge verify-contract $CONTRACT_ADDRESS DailyCanvas $ETHERSCAN_API_KEY --chain 5