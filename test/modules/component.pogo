module.exports = {

    print the time (printer) =
        now = clock.tell the time ()
        printer.print "The time is #(now)"

    print the time soon! (printer) =
        now = clock.tell the time async!
        printer.print "The time is #(now)"

}
