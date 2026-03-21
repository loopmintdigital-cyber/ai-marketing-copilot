export async function POST() {
  return Response.json({
    result: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 style="font-size:40px;">🚀 AI Website Loaded</h1>
</body>
</html>`,
  });
}