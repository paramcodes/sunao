import PlaylistPage from "./playlist-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaylistPage id={id} />;
}
