// 새 상담 신청 → 텔레그램 알림 (연락처·상담내용은 일부러 안 보냄)
// 배포: supabase functions deploy notify --no-verify-jwt
// 시크릿: supabase secrets set HOOK_SECRET=<긴랜덤> TG_TOKEN=<봇토큰> TG_CHAT=<채팅ID>
// 연결: Supabase 대시보드 → Database → Webhooks → 신청 테이블 INSERT → HTTP Request
//       URL = 이 함수 주소, Header  x-hook-secret: <HOOK_SECRET과 동일한 값>
Deno.serve(async (req) => {
  if (req.headers.get("x-hook-secret") !== Deno.env.get("HOOK_SECRET")) {
    return new Response("unauthorized", { status: 401 });
  }
  const { record: r } = await req.json();
  const t = (v: unknown) => String(v ?? "-").slice(0, 60);
  const text = `📩 새 상담 신청\n${t(r?.name)} · ${t(r?.subcategory)}\n${t(r?.lab_interest)}\n관리자 페이지에서 확인하세요.`;
  const res = await fetch(`https://api.telegram.org/bot${Deno.env.get("TG_TOKEN")}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: Deno.env.get("TG_CHAT"), text }),
  });
  return new Response(res.ok ? "ok" : "tg_failed", { status: res.ok ? 200 : 502 });
});
