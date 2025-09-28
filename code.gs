var discordWebhook = "https://discord.com/api/webhooks/1406206784527401011/APp9KpfhY-E1ZCFFVZt8-XxjI62EXG5U-1AGOipdIbmKtA_Ud9b2T4iZv23c-TRXW3Fa"

function sendRenthopListingsToDiscord() {
  var labelName = "Reported"; // Label to mark processed emails
  var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

  // Search for unread emails from nina@renthop.com that do NOT have the Reported label
  var threads = GmailApp.search('from:nina@renthop.com is:unread -label:' + labelName);

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(msg) {
      var subject = msg.getSubject();
      var body = msg.getBody(); // HTML version
      var listingsFound = [];

      // Regex to capture each listing block
      var regex = /<a[^>]+href="(https:\/\/www\.renthop\.com\/listings\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      var match;

      while ((match = regex.exec(body)) !== null) {
        var url = match[1];
        var block = match[2];

        // Extract title/address
        var titleMatch = block.match(/<div[^>]*font-weight:\s*bold[^>]*>(.*?)<\/div>/);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "Unknown Address";

        // Extract price
        var priceMatch = block.match(/<b>(.*?)<\/b>/);
        var price = priceMatch ? priceMatch[1].trim() : "N/A";

        // Extract bed/bath text (the line right after price)
        var bedBathMatch = block.match(/<\/b>([^<]+)/);
        var bedBath = bedBathMatch ? bedBathMatch[1].replace(/&nbsp;/g, " ").trim() : "";

        listingsFound.push(`🏠 ${title}\n💲 ${price} | ${bedBath}\n🔗 ${url}`);
      }

      if (listingsFound.length > 0) {
        // Combine subject + listings
        var content = "**" + subject + "**\n\n" + listingsFound.join("\n\n---\n\n");
        // Send in chunks under 2000 characters
        sendInChunks(content);
      }

      // Mark the message as read and apply the "Reported" label
      msg.markRead();
      label.addToThread(thread);
    });
  });
}

// Helper to split content into Discord-friendly chunks
function sendInChunks(content) {
  var maxLength = 1900; // Slightly under 2000 to be safe
  var webhookUrl = discordWebhook;

  while (content.length > 0) {
    var chunk = content.slice(0, maxLength);

    // Try to cut at last line break to avoid splitting a listing in half
    var lastBreak = chunk.lastIndexOf("\n\n");
    if (lastBreak > 0) {
      chunk = chunk.slice(0, lastBreak);
    }

    var payload = JSON.stringify({ content: chunk });
    UrlFetchApp.fetch(webhookUrl, { method: "post", contentType: "application/json", payload: payload });

    content = content.slice(chunk.length).trim();
  }
}
