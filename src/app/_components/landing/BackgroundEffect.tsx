export function BackgroundEffect() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-bg pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-24"
        style={{ backgroundImage: "url('/nature-bg.jpg')" }}
      />
    </div>
  );
}
