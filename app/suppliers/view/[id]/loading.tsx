import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageAnimation } from "@/components/page-animation"

export default function ViewSupplierLoading() {
  return (
    <PageAnimation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#9c2d40]/10 shadow-md">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-64" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#9c2d40]/10 shadow-md md:col-span-2">
            <CardHeader className="bg-[#9c2d40]/5 rounded-t-lg">
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageAnimation>
  )
}
