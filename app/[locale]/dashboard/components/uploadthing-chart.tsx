"use client";
import { useEffect, useState } from "react";
import { HardDrive, Files } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUploadThingUsage } from "@/actions/uploadthing/usage";
type UploadThingUsage = {
  appTotalBytes: number;
  filesUploaded: number;
  limitBytes: number;
  totalBytes: number;
};
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}
export function ChartBarDefault() {
  const [usage, setUsage] = useState<UploadThingUsage | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function getUsage() {
      try {
        const data = await getUploadThingUsage();
        setUsage(data);
      } catch (error) {
        console.error("Error fetching UploadThing usage:", error);
      } finally {
        setLoading(false);
      }
    }
    getUsage();
  }, []);
  if (loading) {
    return (
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>UploadThing Usage</CardTitle>{" "}
          <CardDescription>
            {" "}
            Storage usage for your application{" "}
          </CardDescription>{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />{" "}
        </CardContent>{" "}
      </Card>
    );
  }
  if (!usage) {
    return (
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>UploadThing Usage</CardTitle>{" "}
          <CardDescription>
            {" "}
            Unable to load usage information{" "}
          </CardDescription>{" "}
        </CardHeader>{" "}
      </Card>
    );
  }
  const percentage =
    usage.limitBytes > 0 ? (usage.totalBytes / usage.limitBytes) * 100 : 0;
  return (
    <Card>
      {" "}
      <CardHeader>
        {" "}
        <CardTitle>UploadThing Usage</CardTitle>{" "}
        <CardDescription>
          {" "}
          Storage usage for your application{" "}
        </CardDescription>{" "}
      </CardHeader>{" "}
      <CardContent className="space-y-6">
        {" "}
        {/* Storage */}{" "}
        <div className="space-y-3">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <HardDrive className="size-4 text-muted-foreground" />{" "}
              <span className="text-sm font-medium"> Storage </span>{" "}
            </div>{" "}
            <span className="text-sm text-muted-foreground">
              {" "}
              {formatBytes(usage.totalBytes)} /{" "}
              {formatBytes(usage.limitBytes)}{" "}
            </span>{" "}
          </div>{" "}
          {/* Progress */}{" "}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            {" "}
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />{" "}
          </div>{" "}
          <div className="flex justify-between text-xs text-muted-foreground">
            {" "}
            <span>{percentage.toFixed(2)}% used</span>{" "}
            <span>
              {" "}
              {formatBytes(usage.limitBytes - usage.totalBytes)} remaining{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Files */}{" "}
        <div className="flex items-center justify-between rounded-lg border p-4">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              {" "}
              <Files className="size-4" />{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm font-medium"> Files uploaded </p>{" "}
              <p className="text-xs text-muted-foreground">
                {" "}
                Total files stored{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <span className="text-2xl font-semibold">
            {" "}
            {usage.filesUploaded}{" "}
          </span>{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
}
