import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="error-page">
      <h1>Không tìm thấy trang này</h1>
      <p>Về trang đầu để xem Words for Kids.</p>
      <Button asChild size="lg">
        <Link href="/">Về trang đầu</Link>
      </Button>
    </div>
  );
}
