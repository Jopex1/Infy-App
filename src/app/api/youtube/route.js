import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ titles: {} });
    }

    const uniqueIds = [...new Set(ids)];
    const titles = {};

    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
            { next: { revalidate: 86400 } }
          );
          if (res.ok) {
            const data = await res.json();
            titles[id] = data.title;
          }
        } catch {
          // leave id out of titles on failure
        }
      })
    );

    return NextResponse.json({ titles });
  } catch (error) {
    return NextResponse.json({ titles: {}, error: error.message }, { status: 500 });
  }
}
