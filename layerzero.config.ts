import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'CrosschainMerkle',
}

const opTestnetContract: OmniPointHardhat = {
    eid: EndpointId.OPTSEP_V2_TESTNET,
    contractName: 'CrosschainMerkle',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: sepoliaContract,
        },
        {
            contract: opTestnetContract,
        }

    ],
    connections: [
        // {
        //     from: fujiContract,
        //     to: sepoliaContract,
        //     config: {
        //         sendConfig: {
        //             executorConfig: {
        //                 maxMessageSize: 99,
        //                 executor: '0x71d7a02cDD38BEa35E42b53fF4a42a37638a0066',
        //             },
        //             ulnConfig: {
        //                 confirmations: BigInt(42),
        //                 requiredDVNs: [],
        //                 optionalDVNs: [
        //                     '0xe9dCF5771a48f8DC70337303AbB84032F8F5bE3E',
        //                     '0x0AD50201807B615a71a39c775089C9261A667780',
        //                 ],
        //                 optionalDVNThreshold: 2,
        //             },
        //         },
        //         receiveConfig: {
        //             ulnConfig: {
        //                 confirmations: BigInt(42),
        //                 requiredDVNs: [],
        //                 optionalDVNs: [
        //                     '0x3Eb0093E079EF3F3FC58C41e13FF46c55dcb5D0a',
        //                     '0x0AD50201807B615a71a39c775089C9261A667780',
        //                 ],
        //                 optionalDVNThreshold: 2,
        //             },
        //         },
        //     },
        // },
        {
            from: opTestnetContract,
            to: sepoliaContract,
        },
        {
            from: sepoliaContract,
            to: opTestnetContract,
        },
    ],
}

export default config
