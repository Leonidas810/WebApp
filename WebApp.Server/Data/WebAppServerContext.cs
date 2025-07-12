using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApp.Server.Models;

namespace WebApp.Server.Data
{
    public class WebAppServerContext : DbContext
    {
        public WebAppServerContext (DbContextOptions<WebAppServerContext> options)
            : base(options)
        {
        }

        public DbSet<WebApp.Server.Models.Records> Records { get; set; } = default!;
    }
}
