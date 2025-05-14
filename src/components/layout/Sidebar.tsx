
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Calendar, Building, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Bookings", href: "/bookings", icon: Calendar },
  { name: "Staff", href: "/staff", icon: Users },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarContainer className="hidden md:flex">
      <SidebarHeader className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-emplify-600" />
          <span className="text-xl font-semibold">Emplify</span>
        </div>
        <SidebarTrigger>
          <MenuIcon className="h-4 w-4" />
        </SidebarTrigger>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    className={cn(
                      currentPath === item.href ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                      "w-full justify-start"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emplify-100 flex items-center justify-center">
            <span className="font-medium text-emplify-600">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@emplify.com</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
