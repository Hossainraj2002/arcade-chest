// src/lib/neynar.ts

// Fetches user profile (PFP + display name) from Neynar API
// Reference: https://docs.neynar.com/reference/fetch-bulk-users

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_BASE_URL = "https://api.neynar.com/v2";

export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export async function fetchUsersByFid(
  fids: number[]
): Promise<NeynarUser[]> {
  if (!NEYNAR_API_KEY || fids.length === 0) return [];

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${fids.join(",")}`,
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.users || [];
  } catch {
    console.error("Neynar fetch failed");
    return [];
  }
}

export async function fetchUserByAddress(
  address: string
): Promise<NeynarUser | null> {
  if (!NEYNAR_API_KEY) return null;

  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const users = data[address.toLowerCase()];
    return users && users.length > 0 ? users[0] : null;
  } catch {
    console.error("Neynar address lookup failed");
    return null;
  }
}