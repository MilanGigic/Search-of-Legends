export async function POST() {
  const res = await fetch("/joined-match_participants.json");

  const data = await res.json();

  return new Response(JSON.stringify(data), { status: 200 });
}

// figure this shit out
