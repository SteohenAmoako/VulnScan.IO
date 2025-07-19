export function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center mx-auto justify-center items-center px-4 md:px-6 border-t">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} VulnScan.IO. All rights reserved. For educational purposes only.
      </p>
    </footer>
  );
}
