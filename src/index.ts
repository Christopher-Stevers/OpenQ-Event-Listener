import { ethers } from "ethers";
import axios, { AxiosRequestHeaders } from "axios";

import { OpenQV1 } from "../typechain";
import { abi as OpenQABI } from "../OpenQV1.json";

import eventGenerator from "./eventGenerator";

require("dotenv").config();

// const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL as string)
const provider = new ethers.providers.WebSocketProvider(
	process.env.PROVIDER_URL as string
);

const OPENQ_PROXY_ADDRESS = process.env.OPENQ_PROXY_ADDRESS as string;

const openQ = new ethers.Contract(OPENQ_PROXY_ADDRESS, OpenQABI, provider) as OpenQV1;

const BountyCreatedFilter = openQ.filters.BountyCreated();

const TokenDepositReceivedFilter = openQ.filters.TokenDepositReceived();

const DepositRefundedFilter = openQ.filters.DepositRefunded();

const BountyClosedFilter = openQ.filters.BountyClosed();

async function main() {
	const events = await openQ.queryFilter(BountyCreatedFilter);

	console.log("---------------------------------");

	openQ.on(
		BountyCreatedFilter,
		async (
			bountyId,
			organization,
			issuerAddress,
			bountyAddress,
			bountyMintTime,
			bountyType,
		) => {
			console.log({
				bountyId,
				organization,
				issuerAddress,
				bountyAddress,
				bountyMintTime,
				bountyType,
			});

			const headers = {
				Authorization: process.env.OPENQ_API_SECRET,
			};

			try {
				console.log('calling')
				const result = await axios.post(
					`${process.env.OPENQ_BOUNTY_ACTIONS_AUTOTASK_URL}`,
					eventGenerator("BountyCreated", {
						bountyAddress,
						bountyId,
						organization,
						bountyType,
					}),
					{ headers: headers as AxiosRequestHeaders }
				);
				console.log(result)
			} catch (error) {
				console.error(error);
			}
		}
	);

	openQ.on(
		TokenDepositReceivedFilter,
		async (
			depositId,
			bountyAddress,
			bountyId,
			organization,
			tokenAddress,
			receiveTime,
			sender,
			expiration,
			volume
		) => {
			console.log({
				depositId,
				bountyAddress,
				bountyId,
				organization,
				tokenAddress,
				receiveTime,
				sender,
				expiration,
				volume,
			});

			const headers = {
				Authorization: process.env.OPENQ_API_SECRET,
			};

			try {
				const result = await axios.post(
					`${process.env.OPENQ_BOUNTY_ACTIONS_AUTOTASK_URL}`,
					eventGenerator("TokenDepositReceived", {
						tokenAddress,
						volume,
						bountyAddress,
						bountyId,
					}),
					{ headers: headers as AxiosRequestHeaders }
				);
			} catch (error) {
				console.error(error);
			}
		}
	);

	openQ.on(
		DepositRefundedFilter,
		async (
			depositId,
			bountyId,
			bountyAddress,
			organization,
			refundTime,
			tokenAddress,
			volume
		) => {
			console.log({
				depositId,
				bountyId,
				bountyAddress,
				organization,
				refundTime,
				tokenAddress,
				volume,
			});

			const headers = {
				Authorization: process.env.OPENQ_API_SECRET,
			};

			try {
				const result = await axios.post(
					`${process.env.OPENQ_BOUNTY_ACTIONS_AUTOTASK_URL}`,
					eventGenerator("DepositRefunded", {
						depositId,
						bountyId,
						bountyAddress,
						organization,
						refundTime,
						tokenAddress,
						volume,
					}),
					{ headers: headers as AxiosRequestHeaders }
				);
			} catch (error) {
				console.error(error);
			}
		}
	);

	openQ.on(
		BountyClosedFilter,
		async (
			bountyId,
			bountyAddress,
			organization,
			closer,	
			bountyClosedTime,
			closerData
		) => {
			console.log({
				bountyId,
				bountyAddress,
				organization,
				closer,
				bountyClosedTime,
				closerData
			});

			const headers = {
				Authorization: process.env.OPENQ_API_SECRET,
			};

			try {
				const result = await axios.post(
					`${process.env.OPENQ_BOUNTY_ACTIONS_AUTOTASK_URL}`,
					eventGenerator("BountyClosed", {
						bountyId,
						bountyAddress,
						organization,
						closer,
						bountyClosedTime,
						closerData
					}),
					{ headers: headers as AxiosRequestHeaders }
				);
				console.log(result);
			} catch (error) {
				console.error(error);
			}
		}
	);
}

main();

