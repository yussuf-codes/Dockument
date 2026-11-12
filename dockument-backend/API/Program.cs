using API.Persistence;
using API.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;

namespace API;

public class Program
{
	public static void Main()
	{
		WebApplicationBuilder builder = WebApplication.CreateBuilder();

		builder.Services.AddControllers();

		builder.Services.AddCors(options =>
		{
		    options.AddPolicy("AllowFrontend", policy =>
		    {
		        policy
		            .WithOrigins("http://localhost", "http://127.0.0.1", "http://localhost:3000")
		            .AllowAnyHeader()
		            .AllowAnyMethod();
		    });
		});

		builder.Services.AddScoped<NotesRepository>();

		builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase("Database"));

		// string connectionString = builder.Configuration["ConnectionStrings:DefaultConnection"] ?? throw new Exception("Connection string is not provided.");

		builder.Services.AddOpenApi();

		WebApplication app = builder.Build();

		app.UseCors("AllowFrontend");

		if (app.Environment.IsDevelopment())
		{
			app.MapOpenApi();
			app.MapScalarApiReference();
		}

		app.MapControllers();

		app.Run();
	}
}
