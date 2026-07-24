import CircleAbi from "./abi/Circle.json";
import CircleFactoryAbi from "./abi/CircleFactory.json";
import ReputationRegistryAbi from "./abi/ReputationRegistry.json";
import MockKRWAbi from "./abi/MockKRW.json";
import type { Address } from "viem";

// Filled in after `forge script Deploy`. Override via NEXT_PUBLIC_* env vars.
export const addresses = {
  factory: (process.env.NEXT_PUBLIC_FACTORY ?? "0x0000000000000000000000000000000000000000") as Address,
  reputation: (process.env.NEXT_PUBLIC_REPUTATION ?? "0x0000000000000000000000000000000000000000") as Address,
  mkrw: (process.env.NEXT_PUBLIC_MKRW ?? "0x0000000000000000000000000000000000000000") as Address,
};

export const abis = {
  circle: CircleAbi,
  factory: CircleFactoryAbi,
  reputation: ReputationRegistryAbi,
  mkrw: MockKRWAbi,
} as const;
