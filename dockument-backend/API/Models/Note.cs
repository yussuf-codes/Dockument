using System;

namespace API.Models;

using System;
using System.ComponentModel.DataAnnotations;

public class Note
{
	[Key]
	public Guid Id { get; private set; } = Guid.NewGuid();
	public required string Title { get; set; }
	public required string Body { get; set; }
}
