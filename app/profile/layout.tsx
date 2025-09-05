export default function ProfileLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div>
        <nav>Profile Navigation</nav>
        {children}
      </div>
    )
  }