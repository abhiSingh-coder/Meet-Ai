import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAgentsFilters } from "@/app/(dashboard)/agents/hooks/use-agents-filters";


export const AgentsSearchFilter = () => {
    const [filters, setFilters] = useAgentsFilters();

    return (
        <div className="relative">
            <Input
                aria-label="Search agents by name"
                placeholder="Filter by name"
                className="h-9 bg-white w-50 pl-7"
                value={filters.search}
                value={filters.search}
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAgentsFilters } from "@/app/(dashboard)/agents/hooks/use-agents-filters";
import { DEFAULT_PAGE } from "@/constants";

...

                onChange={(e) =>
                    setFilters({ search: e.target.value, page: DEFAULT_PAGE })
                }
            />
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
};