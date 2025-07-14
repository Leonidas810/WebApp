using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp.Server.Data;
using WebApp.Server.Models;

namespace WebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordsController : Controller
    {
        private readonly WebAppServerContext _context;

        public RecordsController(WebAppServerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var records = await _context.Records.ToListAsync();
                return Ok(records);
            }
            catch (Exception err)
            {
                return StatusCode(500, err.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOne(int id)
        {
            try
            {
                var record = await _context.Records.FirstOrDefaultAsync(m => m.Id == id);
                if (record == null) return NotFound($"Record with Id = {id} not found");

                return Ok(record);
            }
            catch (Exception err)
            {
                return StatusCode(500,  err.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Records record)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                _context.Add(record);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(Details), new { id = record.Id }, record);
            } 
            catch (Exception err)
            {
                return StatusCode(500, err.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> Edit([FromBody] Records record)
        {
            try
            {
                var existingRecord = await _context.Records.FindAsync(record.Id);
                if (existingRecord == null)
                    return NotFound($"Record with Id = {record.Id} not found");

                existingRecord.Platform = record.Platform;
                existingRecord.dateTime = record.dateTime;

                await _context.SaveChangesAsync();
                return Ok(existingRecord);
            }
            catch(Exception err)
            {
                return StatusCode(500, err.Message);
            }
        }
    }
}
