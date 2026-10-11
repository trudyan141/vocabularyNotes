"use client";
import {useState} from "react";
import {useApp} from "@/components/app/provider";
import {Button} from "@/components/ui/button";
export function CurrentLibrary(){
 const {t,demo,selectLocalLibrary,repository}=useApp();
 const [switching,setSwitching]=useState(false),[scopeStatus,setScopeStatus]=useState("");
 return (      <section className="page-flow"><h2>{t("Thư viện đang mở","Current library")}</h2><p>{repository?.scope.kind==="account"?t("Đang dùng thư viện tài khoản. Bài được đồng bộ giữa các thiết bị khi có mạng.","Using your account library. Lessons sync between devices while online."):demo?t("Đang dùng bài mẫu để thử. Bài của con thật được lưu riêng, chuyển qua lại không xóa hay gộp dữ liệu.","Using sample lessons. Your own library is stored separately; switching does not delete or merge content."):t("Đang dùng thư viện của con trên máy này. Bài mẫu là một thư viện riêng.","Using your own local library. Sample lessons are stored separately.")}</p><Button variant="outline" disabled={switching||!repository} onClick={async()=>{setSwitching(true);try{await selectLocalLibrary(!demo);setScopeStatus(t("Đã chuyển thư viện; dữ liệu thư viện trước vẫn còn.","Library switched; previous content is preserved."));}catch{setScopeStatus(t("Chưa chuyển được. Thử lại; dữ liệu vẫn còn.","Could not switch. Retry; your content is preserved."));}finally{setSwitching(false);}}}>{demo?t("Dùng thư viện riêng của con","Use my child's library"):t("Mở bài mẫu để thử","Open sample lessons")}</Button><p role="status">{scopeStatus}</p></section>
);
}
